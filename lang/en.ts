export default {
  objects: {
    team: 'Team',
  },
  emails: {
    salutation: 'Hello',
    signature: `${process.env.COMPANY_NAME} Team`,
    applications: {
      onTheWay: {
        subject: (jobTitle?: String) =>
          `You application for ${jobTitle} is on its way`,
        body: (name?: string, title?: string, location?: string) =>
          `Congratulations ${name}, \n\nyour application for the position ${title} at ${location}. If you you would like to speed up the proccess please fill out our registration form at \n\n <a href="${process.env.REGISTER_URL}/register?utm_source=myexactjobs&utm_medium=email&utm_campaign=myexactjobs_application&utm_term=My%20Exact%20Jobs&utm_content=My%20Exact%20Jobs%20Application">${process.env.REGISTER_URL}/register/</a>`,
      },
      hasNewApplication: {
        subject: (title?: string) =>
          `Your listing for ${title} has a new application!`,
        body: (
          author?: string,
          applicant?: string,
          title?: string,
          location?: string,
          applicationId?: string,
        ) =>
          `Hola ${author}, \n\nEl candidato ${applicant} envio una solicitud para el puesto de trabajo titulado "${title}" en ${location} 😁. Haz click aqui para ver la hoja de vida del candidato\n\n<a href="${process.env.FRONTEND_URL}/admin/applications/${applicationId}">${process.env.FRONTEND_URL}/admin/applications/${applicationId}</a>`,
      },
    },
    users: {
      invite: {
        subject: `${process.env.COMPANY_NAME} Invite`,
        body: (resetToken: string, name?: string) =>
          `${name}, an account at MyExactJobs has been created for you, please click on the following link to setup your password! \n\n <a href="${process.env.FRONTEND_URL}/user/password/reset?resetToken=${resetToken}">Click Here to Create Password</a>`,
      },
      reset: {
        subject: `Your Password Reset Token`,
        body: (resetToken: string) =>
          `Your password Reset Token is here! \n\n <a href="${process.env.FRONTEND_URL}/user/password/reset?resetToken=${resetToken}">Click Here to Reset</a>`,
      },
    },
  },
  messages: {
    user: {
      alreadyExists: 'An user with this email already exists',
      doesnExist: (email: string) => `No user found for email: ${email}`,
      notActive: `Your account is not active, please contact support`,
      invalidPassword: 'Invalid password',
      passwordsDontMatch: `Passwords don't match`,
      invalidToken: 'This token is either invalid or expired!',
    },
  },
}
