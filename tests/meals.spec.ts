import { it, describe, beforeAll, afterAll, beforeEach, expect } from 'vitest'

import request from 'supertest'

import { app } from '../src/app'

import { execSync } from 'child_process'

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        username: 'john-doe',
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .send({
        name: 'Lasanha',
        description: 'Lasanha de frango',
        isOnDiet: true,
        mealTime: new Date(),
      })
      .expect(201)
  })

  it('should be able to list all meals from an user', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        username: 'john-doe',
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .send({
        name: 'Lasanha',
        description: 'Lasanha de frango',
        isOnDiet: true,
        mealTime: new Date(),
      })
      .expect(201)

    const listMealResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .expect(200)

    expect(listMealResponse.body.meals).toEqual([
      expect.objectContaining({
        name: 'Lasanha',
        description: 'Lasanha de frango',
        is_on_diet: 1,
        meal_time: expect.any(Number),
      }),
    ])
  })

  it('should be able to get a specific meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        username: 'john-doe',
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .send({
        name: 'Lasanha',
        description: 'Lasanha de frango',
        isOnDiet: true,
        mealTime: new Date(),
      })
      .expect(201)

    const listMealResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .expect(200)

    const mealId = listMealResponse.body.meals[0].id

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .expect(200)

    expect(getMealResponse.body).toEqual({
      meal: expect.objectContaining({
        name: 'Lasanha',
        description: 'Lasanha de frango',
        is_on_diet: 1,
        meal_time: expect.any(Number),
      }),
    })
  })

  it('should be able to get the summary', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        username: 'john-doe',
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .send({
        name: 'Lasanha',
        description: 'Lasanha de frango',
        isOnDiet: true,
        mealTime: new Date('2023-01-01T20:00:00'),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .send({
        name: 'Parmegiana',
        description: 'Parmegiana de frango',
        isOnDiet: false,
        mealTime: new Date('2023-01-02T08:00:00'),
      })
      .expect(201)

    const summaryResponse = await request(app.server)
      .get('/meals/summary')
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .expect(200)

    expect(summaryResponse.body).toEqual({
      mealsOnDiet: 1,
      mealsOffDiet: 1,
      totalMeals: 2,
      bestOnDietSequence: 1,
    })
  })

  it('should be able to update a meal from an user', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        username: 'john-doe',
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .send({
        name: 'Lasanha',
        description: 'Lasanha de frango',
        isOnDiet: true,
        mealTime: new Date('2023-01-01T20:00:00'),
      })
      .expect(201)

    const mealResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .expect(200)

    const mealId = mealResponse.body.meals[0].id

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .send({
        name: 'Parmegiana',
        description: 'Parmegiana de frango',
        isOnDiet: false,
        mealTime: new Date('2023-01-02T08:00:00'),
      })
      .expect(204)
  })

  it('should be able to delete a meal from an user', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        username: 'john-doe',
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .send({
        name: 'Lasanha',
        description: 'Lasanha de frango',
        isOnDiet: true,
        mealTime: new Date('2023-01-01T20:00:00'),
      })
      .expect(201)

    const mealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .expect(200)

    const mealId = mealsResponse.body.meals[0].id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .expect(204)
  })
})
