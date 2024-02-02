import { FastifyInstance } from 'fastify'

import { randomUUID } from 'node:crypto'

import { z } from 'zod'

import { knex } from '../database'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      username: z.string(),
    })

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    const { username } = createUserBodySchema.parse(request.body)

    const doesUserAlreadyExist = await knex('users').where({ username }).first()

    if (doesUserAlreadyExist) {
      return reply.status(400).send({ message: 'User already exists' })
    }

    await knex('users').insert({
      id: randomUUID(),
      username,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
