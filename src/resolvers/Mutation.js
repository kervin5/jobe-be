const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../../startup/db");
const { randomBytes } = require("crypto");
const { promisify } = require("util");
const { can } = require("../lib/auth");
// const { forwardTo } = require("prisma-binding");
const { userExists, findKeywords } = require("../lib/utils");
const { sign_s3_upload } = require("../lib/aws");
const { transport, makeANiceEmail } = require("../lib/mail");
const { fetchLocation } = require("../lib/location");
const request = require("../lib/request");
const {
  scheduleJobAutoUpdate,
  unscheduleJobAutoUpdate
} = require("../lib/schedule");
const { sign_s3_read } = require("../lib/aws");

const Mutations = {
  async createUser(parent, args, ctx, info) {
    const salt = await bcrypt.genSalt(10);

    const randomBytesPromisified = promisify(randomBytes);
    const resetToken = (await randomBytesPromisified(20)).toString("hex");
    const resetTokenExpiry = (Date.now() + 3600000) * 24; // 1 hour from now

    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          branch: {
            connect: { id: args.branch }
          },
          role: { connect: { id: args.role } },
          password: await bcrypt.hash(resetToken + resetTokenExpiry, salt),
          resetToken,
          resetTokenExpiry
        }
      },
      info
    );

    const mailRes = await transport.sendMail({
      from: "noreply@myexactjobs.com",
      to: user.email,
      subject: "My Exact Jobs Invite",
      html: makeANiceEmail(
        `${
          args.name
        }, an account at MyExactJobs has been created for you, please click on the following link to setup your password! \n\n <a href="${
          process.env.FRONTEND_URL
        }/user/password/reset?resetToken=${resetToken}">Click Here to Create Password</a>`
      )
    });
    return user;
  },
  async updateUser(parent, args, ctx, info) {
    const name = args.name ? { name: args.name } : {};
    const branch = args.branch
      ? {
          branch: { connect: { id: args.branch } }
        }
      : {};
    const role = args.role ? { role: { connect: { id: args.role } } } : {};
    return await ctx.db.mutation.updateUser(
      {
        where: { id: args.id },
        data: {
          ...name,
          ...branch,
          ...role
        }
      },
      info
    );
  },

  async createRole(parent, args, ctx, info) {
    return await ctx.db.mutation.createRole(
      {
        data: {
          name: args.name,
          permissions: {
            create: args.permissions.map(permission => ({
              object: permission.object,
              actions: { set: permission.actions }
            }))
          }
        }
      },
      info
    );
  },

  async updateRole(parent, args, ctx, info) {
    if (!userExists(ctx)) {
      return null;
    }

    const role = await ctx.db.query.role(
      { where: { id: args.id } },
      `{
            id
            name
            permissions {
                id
            }
        }`
    );

    return await ctx.db.mutation.updateRole(
      {
        data: {
          name: args.name || role.name,
          permissions: {
            delete: role.permissions.map(permission => ({ id: permission.id })),
            create: args.permissions.map(permission => ({
              object: permission.object,
              actions: { set: permission.actions }
            }))
            // create: args.permissions
          }
        },
        where: { id: args.id }
      },
      info
    );
  },

  async signup(parent, args, ctx, info) {
    const salt = await bcrypt.genSalt(10);

    let usersCount = await ctx.db.query.usersConnection(
      {},
      `{
      aggregate {
        count
      }
    }`
    );

    //A role must exist in the database
    let defaultRole = await ctx.db.query.role({ where: { name: "candidate" } });
    if (!defaultRole) {
      defaultRole = await ctx.db.mutation.createRole({
        data: {
          name: "candidate",
          permissions: {
            create: [
              {
                object: "JOB",
                actions: { set: ["READ"] }
              },
              {
                object: "APPLICATION",
                actions: { set: ["CREATE", "READ", "UPDATE", "DELETE"] }
              },
              {
                object: "FAVORITE",
                actions: { set: ["CREATE", "READ", "UPDATE", "DELETE"] }
              },
              {
                object: "RESUME",
                actions: { set: ["CREATE", "READ", "UPDATE", "DELETE"] }
              }
            ]
          }
        }
      });
    }

    if (usersCount.aggregate.count === 0) {
      defaultRole = await ctx.db.mutation.createRole({
        data: {
          name: "administrator",
          permissions: {
            create: [
              {
                object: "JOB",
                actions: {
                  set: ["CREATE", "READ", "UPDATE", "DELETE", "PUBLISH"]
                }
              },
              {
                object: "APPLICATION",
                actions: {
                  set: ["CREATE", "READ", "UPDATE", "DELETE"]
                }
              },
              {
                object: "USER",
                actions: { set: ["CREATE", "READ", "UPDATE", "DELETE"] }
              },
              {
                object: "ROLE",
                actions: { set: ["CREATE", "READ", "UPDATE", "DELETE"] }
              },
              {
                object: "PERMISSION",
                actions: { set: ["CREATE", "READ", "UPDATE", "DELETE"] }
              },
              {
                object: "SKILL",
                actions: { set: ["CREATE", "READ", "UPDATE", "DELETE"] }
              },
              {
                object: "CATEGORY",
                actions: { set: ["CREATE", "READ", "UPDATE", "DELETE"] }
              },
              {
                object: "BRANCH",
                actions: { set: ["CREATE", "READ", "UPDATE", "DELETE"] }
              },
              {
                object: "COMPANY",
                actions: { set: ["CREATE", "READ", "UPDATE", "DELETE"] }
              },
              ,
              {
                object: "RESUME",
                actions: { set: ["CREATE", "READ", "UPDATE", "DELETE"] }
              },
              {
                object: "FAVORITE",
                actions: { set: ["CREATE", "READ", "UPDATE", "DELETE"] }
              }
            ]
          }
        }
      });
    }

    try {
      const user = await ctx.db.mutation.createUser(
        {
          data: {
            ...args,
            password: await bcrypt.hash(args.password, salt),
            role: {
              connect: { id: defaultRole.id }
            }
          }
        },
        `{
              id
              name
              role {
                  id
                  name
              }
          }`
      );

      const token = jwt.sign({ id: user.id }, process.env.APP_SECRET);
      // 4. Set the cookie with the token
      ctx.response.header("token", token);
      ctx.response.cookie("token", token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365
      });
      // console.log(user);
      return user;
    } catch (error) {
      throw new Error(`An user with this email already exists`);
    }
  },

  async login(parent, { email, password }, ctx, info) {
    // 1. check if there is a user with that email
    const user = await ctx.db.query.user(
      { where: { email } },
      `{
            id
            name
            password
            role {
                id
                name
                permissions {
                    object
                    actions
                }
            }
          }`
    );
    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }

    // 2. Check if their password is correct
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error("Invalid Password!");
    }
    // 3. generate the JWT Token
    const token = jwt.sign({ id: user.id }, process.env.APP_SECRET);
    // 4. Set the cookie with the token
    ctx.response.header("token", token);

    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
      path: "/"
    });
    // 5. Return the user
    return user;
  },
  logout(parent, args, ctx, info) {
    ctx.response.clearCookie("token");
    return "log out";
  },
  async createLocation(parent, args, ctx, info) {
    const location = await ctx.db.mutation.createLocation(
      {
        data: {
          ...args
        }
      },
      info
    );
    return location;
  },

  async createCategory(parent, args, ctx, info) {
    const category = await ctx.db.mutation.createCategory(
      {
        data: {
          ...args
        }
      },
      info
    );
    return category;
  },

  async createSkill(parent, args, ctx, info) {
    const skill = await ctx.db.mutation.createSkill(
      {
        data: {
          ...args
        }
      },
      info
    );
    return skill;
  },

  async createJob(parent, args, ctx, info) {
    if (!ctx.request.user.id) {
      throw new Error(`You are not authorized to perform this action`);
    }

    const user = await ctx.db.query.user(
      { where: { id: ctx.request.user.id } },
      `{
            id
            branch {
                id
                company {
                    id
                }
            }
          }`
    );

    const jobLocation = {
      name: args.location
    };

    const jobIsRecurring = !!args.isRecurring;
    delete args.isRecurring;

    // Checks if location exists in DB
    const locationExists = await prisma.exists.Location(jobLocation);
    let location = {};

    if (locationExists) {
      const existingLocations = await ctx.db.query.locations({
        where: jobLocation
      });

      location = { connect: { id: existingLocations[0].id } };
    } else {
      const fetchedLocation = await fetchLocation(args.location);
      location = {
        create: {
          name: args.location,
          longitude: fetchedLocation.center[1],
          latitude: fetchedLocation.center[0],
          boundary: { set: fetchedLocation.bbox }
        }
      };
    }

    let authorId = ctx.request.user.id;

    if (
      args.author &&
      args.author !== "" &&
      (can("READ", "BRANCH", ctx) ||
        can("READ", "COMPANY", ctx) ||
        can("READ", "USER", ctx))
    ) {
      authorId = args.author;
    } else {
      // console.log(args);
    }

    const job = await ctx.db.mutation.createJob(
      {
        data: {
          ...args,
          categories: {
            connect: args.categories.map(category => ({ id: category }))
          },
          skills: { connect: args.skills.map(skill => ({ id: skill })) },
          status: "DRAFT",
          author: { connect: { id: authorId } },
          location,
          branch: { connect: { id: user.branch.id } },
          maxCompensation: args.maxCompensation || 0
        }
      },
      info
    );

    if (jobIsRecurring) {
      console.log("true");
      await scheduleJobAutoUpdate(ctx, job.id);
    } else {
      console.log(args);
    }

    return job;
  },
  async updateJob(parent, args, ctx, info) {
    let authorId = ctx.request.user.id;

    if (
      args.data.author &&
      args.data.author !== "" &&
      (can("READ", "BRANCH", ctx) ||
        can("READ", "COMPANY", ctx) ||
        can("READ", "USER", ctx))
    ) {
      authorId = args.data.author;
    } else {
      const job = await ctx.db.query.job(
        { where: { id: args.data.id || args.id || args.where.id } },
        `{ id title location { id name } author { id email name}}`
      );
      authorId = job.author.id;
    }

    const jobs = await ctx.db.query.jobs({
      where: {
        id: args.data.id || args.id || args.where.id,
        author: { id: authorId }
      }
    });

    if (
      jobs.length > 0 ||
      can("UPDATE", "BRANCH", ctx) ||
      can("UPDATE", "COMPANY", ctx)
    ) {
      if (args.data.location) {
        const locationExists = await prisma.exists.Location({
          name: args.data.location
        });

        if (locationExists) {
          const existingLocations = await ctx.db.query.locations({
            where: {
              name: args.data.location
            }
          });
          //Deletes the create mutation and forces connection to existing location if the location already exists
          args.data.location = {
            connect: {
              id: existingLocations[0].id
            }
          };
        } else {
          const fetchedLocation = await fetchLocation(args.data.location);
          args.data.location = {
            create: {
              name: args.data.location,
              longitude: fetchedLocation.center[1],
              latitude: fetchedLocation.center[0],
              boundary: { set: fetchedLocation.bbox }
            }
          };
        }
      }
      // console.log(args);
      //Connect User to job
      if (args.data.categories) {
        args.data.categories = {
          set: args.data.categories.map(category => ({ id: category }))
        };
      }

      if (args.data.skills) {
        args.data.skills = {
          set: args.data.skills.map(skill => ({ id: skill }))
        };
      }

      if (!args.data.status) {
        args.data.status = "DRAFT";
      }

      const user = await ctx.db.query.user(
        { where: { id: authorId } },
        `{
              id
              branch {
                  id
                  company {
                      id
                  }
              }
            }`
      );

      args.data.author = { connect: { id: authorId } };
      args.data["branch"] = { connect: { id: user.branch.id } };
      const job = await ctx.db.mutation.updateJob(args, info);

      return job;
    } else {
      return null;
    }
  },
  async deleteJob(parent, args, ctx, info) {
    if (!userExists(ctx)) {
      return null;
    }

    const job = await ctx.db.query.job(
      { where: { id: args.id } },
      `{ id author { id} }`
    );

    if (ctx.request.user.id === job.author.id || can("UPDATE", "BRANCH", ctx)) {
      const result = await ctx.db.mutation.deleteJob({
        where: { id: args.id }
      });
      return result;
    }

    return null;
  },
  async createApplication(parent, args, ctx, info) {
    if (!userExists(ctx)) {
      return null;
    }

    const user = await ctx.db.query.user(
      { where: { id: ctx.request.user.id } },
      `{
            id
            name
            email
            resumes {
                id
            }
        }`
    );
    args.user = { connect: { id: ctx.request.user.id } };
    const job = await ctx.db.query.job(
      { where: { id: args.job.connect.id } },
      `{ id title location { id name } author { id email name}}`
    );

    const application = await ctx.db.mutation.createApplication(
      {
        data: {
          ...args,
          status: "NEW",
          resume: {
            connect: {
              id: user.resumes[0].id
            }
          }
        }
      },
      info
    );

    try {
      const mailRes = await transport.sendMail({
        from: "noreply@myexactjobs.com",
        to: user.email,
        subject: `Your application for ${job.title} is on its way!`,
        html: makeANiceEmail(
          `Congrats ${user.name}, \n\nyour application for the position ${
            job.title
          } at ${
            job.location.name
          } is on it's way 😁. If you you would like to speed up the proccess please fill out our registration form at \n\n <a href="${
            process.env.FRONTEND_URL
          }/register/">${process.env.FRONTEND_URL}/register/</a>`
        )
      });

      const mailRecruiterRes = await transport.sendMail({
        from: "noreply@myexactjobs.com",
        to: job.author.email,
        subject: `Your listing for ${job.title} has a new application!`,
        html: makeANiceEmail(
          `Hi ${job.author.name}, \n\nThe candidate ${
            user.name
          } applied for the position ${job.title} at ${
            job.location.name
          } 😁. Click here to view the resume of the applicant \n\n<a href="${
            process.env.FRONTEND_URL
          }/dashboard/applications/${application.id}">${
            process.env.FRONTEND_URL
          }/dashboard/applications/${application.id}</a>`
        )
      });
    } catch (ex) {
      console.log(ex);
    }

    return application;
  },
  async updateApplicationStatus(parent, args, ctx, info) {
    try {
      const application = await ctx.db.mutation.updateApplication({
        where: { id: args.id },
        data: { status: args.status }
      });

      try {
        const applicationNote = await ctx.db.mutation.createApplicationNote(
          {
            data: {
              content: args.status,
              user: { connect: { id: ctx.request.user.id } },
              application: { connect: { id: args.id } },
              type: "STATUS"
            }
          },
          info
        );
      } catch (error) {
        console.log("note not added");
      }

      return application;
    } catch (err) {
      return null;
    }
  },
  async createApplicationNote(parent, args, ctx, info) {
    try {
      const applicationNote = await ctx.db.mutation.createApplicationNote(
        {
          data: {
            content: args.content,
            user: { connect: { id: ctx.request.user.id } },
            application: { connect: { id: args.id } },
            type: "NOTE"
          }
        },
        info
      );
      return applicationNote;
    } catch (error) {
      return null;
    }
  },
  async addFavorite(parent, args, ctx, info) {
    if (!userExists(ctx)) {
      return null;
    }

    const favorites = await ctx.db.query.favorites({
      where: { user: { id: ctx.request.user.id }, job: { id: args.job } }
    });
    const user = { connect: { id: ctx.request.user.id } };
    const job = { connect: { id: args.job } };

    try {
      if (favorites.length <= 0) {
        await ctx.db.mutation.createFavorite({
          data: {
            user,
            job
          }
        });
      }
      return args.job;
    } catch (err) {
      return null;
    }
  },

  async deleteFavorite(parent, args, ctx, info) {
    if (!userExists(ctx)) {
      return null;
    }

    try {
      const favorites = await ctx.db.query.favorites({
        where: { user: { id: ctx.request.user.id }, job: { id: args.job } }
      });

      if (favorites.length > 0) {
        await ctx.db.mutation.deleteFavorite({
          where: {
            id: favorites[0].id
          }
        });
      }

      return args.job;
    } catch (err) {
      console.log(err);
      return null;
    }
  },
  async signFileUpload(parent, args, ctx, info) {
    if (!userExists(ctx)) {
      return null;
    }

    const result = await sign_s3_upload({
      fileName: args.fileName,
      fileType: args.fileType
    });

    return result.success ? result.data : null;
  },
  async createResume(parent, args, ctx, info) {
    if (!userExists(ctx)) {
      return null;
    }

    const resumeUrl = await sign_s3_read(args.path);
    const resumeJson = await request(process.env.RESUME_PARSER_API, {
      url: resumeUrl
    });
    const resumeText = `${resumeJson.parts.summary} ${
      resumeJson.parts.projects
    }  ${resumeJson.parts.certification} ${resumeJson.parts.certifications} ${
      resumeJson.parts.positions
    } ${resumeJson.parts.objective} ${resumeJson.parts.awards} ${
      resumeJson.parts.skills
    } ${resumeJson.parts.experience} ${
      resumeJson.parts.education
    }`.toLowerCase();
    const allSkills = await ctx.db.query.skills({}, `{ id name }`);

    const resumeSkills = findKeywords(
      resumeText,
      allSkills.map(skill => skill.name)
    ).filter(skill => skill !== "");

    const filteredSkills = allSkills.filter(skill =>
      resumeSkills.includes(skill.name)
    );

    console.log(filteredSkills);

    const result = await ctx.db.mutation.createResume(
      {
        data: {
          file: {
            create: {
              path: args.path,
              mimetype: args.type
            }
          },

          user: {
            connect: { id: ctx.request.user.id }
          },

          title: args.title,
          skills: { connect: filteredSkills.map(skill => ({ id: skill.id })) }
        }
      },
      info
    );

    return result;
  },
  // async updateResumes(parent, args, ctx, info) {
  //   const allResumes = await ctx.db.query.resumes(
  //     {},
  //     `{id file { id path} skills { id } }`
  //   );

  //   try {
  //     const allSkills = await ctx.db.query.skills({}, `{ id name }`);
  //     let resumes = {};

  //     allResumes.reverse().forEach((resume, index) => {
  //       if (resume.skills.length === 0) {
  //         setTimeout(async () => {
  //           try {
  //             const resumeUrl = await sign_s3_read(resume.file.path);
  //             console.log({ index, resumeUrl });
  //             const resumeJson = await request(
  //               "http://simple-resume-parser-api.herokuapp.com/api/resumes",
  //               { url: resumeUrl }
  //             );
  //             console.log(resumeJson);
  //             const resumeText = `${resumeJson.parts.summary} ${resumeJson.parts.certification} ${resumeJson.parts.projects} ${resumeJson.parts.awards} ${resumeJson.parts.certifications} ${resumeJson.parts.objective} ${resumeJson.parts.skills} ${resumeJson.parts.experience} ${resumeJson.parts.education} ${resumeJson.parts.positions}`.toLowerCase();
  //             const resumeSkills = findKeywords(
  //               resumeText,
  //               allSkills.map(skill => skill.name)
  //             ).filter(skill => skill !== "");

  //             const filteredSkills = allSkills.filter(skill =>
  //               resumeSkills.includes(skill.name)
  //             );
  //             console.log(filteredSkills);
  //             const result = await ctx.db.mutation.updateResume(
  //               {
  //                 where: { id: resume.id },
  //                 data: {
  //                   skills: {
  //                     set: filteredSkills.map(skill => ({ id: skill.id }))
  //                   }
  //                 }
  //               },
  //               `{id}`
  //             );

  //             resume[resume.id] = filteredSkills;
  //           } catch (err) {
  //             console.log(index);
  //           }
  //         }, index * 100);
  //       }
  //     });
  //   } catch (error) {
  //     console.log("failed");
  //   }

  //   return allResumes;
  // },

  async createCompany(parent, args, ctx, info) {
    const company = await ctx.db.mutation.createCompany(
      {
        data: {
          ...args
        }
      },
      info
    );
    return company;
  },

  async requestReset(parent, args, ctx, info) {
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) throw new Error("Invalid user");

    const randomBytesPromisified = promisify(randomBytes);
    const resetToken = (await randomBytesPromisified(20)).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    });

    const mailRes = await transport.sendMail({
      from: "noreply@myexactjobs.com",
      to: user.email,
      subject: "Your Password Reset Token",
      html: makeANiceEmail(
        `Your password Reset Token is here! \n\n <a href="${
          process.env.FRONTEND_URL
        }/user/password/reset?resetToken=${resetToken}">Click Here to Reset</a>`
      )
    });

    return args.email;
  },
  async resetPassword(parent, args, ctx, info) {
    // 1. Check if the passwords match
    if (args.password !== args.confirmPassword) {
      throw new Error("Passwords don't match!");
    }
    // 2. Check if its a legit reset token
    // 3. Check if its expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    });

    if (!user) throw new Error("This token is either invalid or expired!");
    // 4. Hash their new password
    const password = await bcrypt.hash(args.password, 10);
    // 5. Save the new password to the user and remove old reset token fields
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null
      }
    });
    // 6. Generate JWT
    const token = jwt.sign({ id: updatedUser.id }, process.env.APP_SECRET);
    // 7. Set the JWT cookie
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    // 8. Return the new user
    return updatedUser;
    // 9. Amazing
  },
  async schedule(parent, args, ctx, info) {
    return await scheduleJobAutoUpdate(ctx, args.id);
  },
  async unschedule(parent, args, ctx, info) {
    return await unscheduleJobAutoUpdate(ctx, args.id);
  }
};

module.exports = Mutations;
