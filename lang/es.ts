export default {
  objects: {
    team: 'equipo',
  },
  emails: {
    salutation: 'Hola',
    signature: `El equipo de ${process.env.COMPANY_NAME}`,
    applications: {
      onTheWay: {
        subject: (jobTitle?: String) =>
          `Tú solicitud para ${jobTitle} esta en camino`,
        body: (name?: string, title?: string, location?: string) =>
          `Felicidades${name}, \n\ntu solicitud para la posición ${title} en ${location} esta en camino😁. No te detengas y sigue explorando otras oportunidades en\n\n <a href="${process.env.FRONTEND_URL}">${process.env.FRONTEND_URL}/register/</a>`,
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
        subject: `Invitacion de ${process.env.COMPANY_NAME}`,
        body: (resetToken: string, name?: string) =>
          `${name}, una cuenta en ${process.env.COMPANY_NAME} ha sido creada para ti, por favor haz click en el siguiente enlace para establecer tu contraseña! \n\n <a href="${process.env.FRONTEND_URL}/user/password/reset?resetToken=${resetToken}">Click aqui para establecer contraseña</a>`,
      },
      reset: {
        subject: `Restablecimiento de contraseña`,
        body: (resetToken: string) =>
          `El enlace para restablecer tu contraseña esta aquí! \n\n <a href="${process.env.FRONTEND_URL}/user/password/reset?resetToken=${resetToken}">Click aqui para restablecer</a>`,
      },
    },
  },
  messages: {
    user: {
      alreadyExists: 'Ya existe una cuenta asociada a este correo',
      doesnExist: (email: string) =>
        `No se encontro una cuenta para el correo: ${email}`,
      notActive: `Tu cuenta no esta activa, por favor contacta soporte técnico`,
      invalidPassword: 'Contraseña invalida',
      passwordsDontMatch: 'Contraseñas no coinciden',
      invalidToken: 'Este enlace es invalido o ya expiró',
    },
  },
}
