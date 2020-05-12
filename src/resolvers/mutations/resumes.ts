import { ObjectDefinitionBlock } from '@nexus/schema/dist/definitions/objectType'
import { stringArg } from '@nexus/schema'
import { sign_s3_read } from '../../utils/aws'
import request from '../../utils/request'
import { findKeywords } from '../../utils/functions'

export default (t: ObjectDefinitionBlock<'Mutation'>) => {
  t.field('createResume', {
    type: 'Resume',
    nullable: true,
    args: {
      path: stringArg({ required: true }),
      type: stringArg({ required: true }),
      title: stringArg({ required: true }),
    },
    resolve: async (parent, args, ctx) => {
      const resumeUrl = await sign_s3_read(args.path)
      const resumeJson = await request(process.env.RESUME_PARSER_API, {
        url: resumeUrl,
      })
      const resumeText = `${resumeJson.parts.summary} ${resumeJson.parts.projects}  ${resumeJson.parts.certification} ${resumeJson.parts.certifications} ${resumeJson.parts.positions} ${resumeJson.parts.objective} ${resumeJson.parts.awards} ${resumeJson.parts.skills} ${resumeJson.parts.experience} ${resumeJson.parts.education}`.toLowerCase()
      const allSkills = await ctx.prisma.skill.findMany()

      const resumeSkills = findKeywords(
        resumeText,
        allSkills.map((skill) => skill.name),
      ).filter((skill) => skill !== '')

      const filteredSkills = allSkills.filter((skill) =>
        resumeSkills.includes(skill.name),
      )

     console.log(ctx.request.user.id);
      
      const skills = filteredSkills.length ? ({ skills: {
        connect: filteredSkills.map((skill) => ({ id: skill.id }))
      }}) : {};
      
     
      const result = await ctx.prisma.resume.create({
        data: {
          file: {
            create: {path: args.path, mimetype: args.type }
          },

          user: {
            connect: { id: ctx.request.user.id }
          },

          title: args.title,
         ...skills
        }
      })

      return result
    },
  })
}
