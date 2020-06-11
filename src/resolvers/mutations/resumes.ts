import { schema } from 'nexus'
import { core } from 'nexus/components/schema'
import { sign_s3_read } from '../../utils/aws'
import request from '../../utils/request'
import { findKeywords } from '../../utils/functions'

export default (t: core.ObjectDefinitionBlock<'Mutation'>) => {
  t.field('createResume', {
    type: 'Resume',
    nullable: true,
    args: {
      path: schema.stringArg({ required: true }),
      type: schema.stringArg({ required: true }),
      title: schema.stringArg({ required: true }),
    },
    resolve: async (parent, args, ctx) => {
      const resumeUrl = await sign_s3_read(args.path)
      const resumeJson = await request(process.env.RESUME_PARSER_API, {
        url: resumeUrl,
      })
      const resumeText = `${resumeJson.parts.summary} ${resumeJson.parts.projects}  ${resumeJson.parts.certification} ${resumeJson.parts.certifications} ${resumeJson.parts.positions} ${resumeJson.parts.objective} ${resumeJson.parts.awards} ${resumeJson.parts.skills} ${resumeJson.parts.experience} ${resumeJson.parts.education}`.toLowerCase()
      const allSkills = await ctx.db.skill.findMany()

      const resumeSkills = findKeywords(
        resumeText,
        allSkills.map((skill) => skill.name),
      ).filter((skill) => skill !== '')

      const filteredSkills = allSkills.filter((skill) =>
        resumeSkills.includes(skill.name),
      )

      const skills = filteredSkills.length
        ? {
            skills: {
              connect: filteredSkills.map((skill) => ({ id: skill.id })),
            },
          }
        : {}

      const result = await ctx.db.resume.create({
        data: {
          file: {
            create: { path: args.path, mimetype: args.type },
          },

          user: {
            connect: { id: ctx.request.user.id },
          },

          title: args.title,
          ...skills,
        },
      })

      return result
    },
  })
}
