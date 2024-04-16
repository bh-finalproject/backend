const request = require('supertest')
const app = require('../app')
const { sequelize } = require('../models')
const { hashPassword } = require('../helpers/bcrypt')
const { signToken } = require('../helpers/jwt')

const userDataSingle = {
    email:'jhon@mail.com'
}


beforeAll(async()=>{
    let users = require('../data/user.json')
    let userData = require('../data/userdata.json')
    let items = require('../data/items.json')

    users.forEach(el=>{
        el.createdAt = new Date()
        el.updatedAt = new Date()
    })
    
    userData.forEach(el=>{
        el.createdAt = new Date()
        el.updatedAt = new Date()
        el.password = hashPassword(el.password)
    })

    items.forEach(el=>{
        el.createdAt = new Date()
        el.updatedAt = new Date()
    })
    await sequelize.queryInterface.bulkInsert('UserData',userData)
    await sequelize.queryInterface.bulkInsert('Users',users)
    await sequelize.queryInterface.bulkInsert('Items',items)
})

afterAll(async()=>{
    await sequelize.queryInterface.bulkDelete('Items',null,{
        truncate:true,
        cascade:true,
        restartIdentity:true
    })
    await sequelize.queryInterface.bulkDelete('Users',null,{
        truncate:true,
        cascade:true,
        restartIdentity:true
    })
    await sequelize.queryInterface.bulkDelete('UserData',null,{
        truncate:true,
        cascade:true,
        restartIdentity:true
    })
})

describe('User route test',()=>{
    describe('POST /user/register - register new user',()=>{
        it('responds with 201 when success', async()=>{
            const body = {
                username:'test',
                email:'test@mail.com',
                password:'test123',
                phoneNumber:'111111111'
            }
            const response = await request(app).post('/user/register').send(body)
            expect(response.status).toBe(201)
            expect(response.body).toBeInstanceOf(Object)
            expect(response.body).toHaveProperty('message','Register account success')
        })

        it('responds with 400 when using wrong email format',async ()=>{
            const body = {
                username:'test',
                email:'test.com',
                password:'test123',
                phoneNumber:'111111111'
            }
            const response = await request(app).post('/user/register').send(body)
            expect(response.status).toBe(400)
        })

        it('responds with 400 when email is empty',async ()=>{
            const body = {
                username:'test',
                password:'test123',
                phoneNumber:'111111111'
            }
            const response = await request(app).post('/user/register').send(body)
            expect(response.status).toBe(400)
        })

        it('responds with 400 when email is already registered',async ()=>{
            const body = {
                username:'test',
                email:'jhon@mail.com',
                password:'test123',
                phoneNumber:'111111111'
            }
            const response = await request(app).post('/user/register').send(body)
            expect(response.status).toBe(400)
        })

        it('responds with 400 when password is empty',async ()=>{
            const body = {
                username:'test',
                email:'test@mail.com',
                password:'',
                phoneNumber:'111111111'
            }
            const response = await request(app).post('/user/register').send(body)
            expect(response.status).toBe(400)
        })

        it('responds with 400 when password is less than 5 char length',async ()=>{
            const body = {
                username:'test',
                email:'test@mail.com',
                password:'test',
                phoneNumber:'111111111'
            }
            const response = await request(app).post('/user/register').send(body)
            expect(response.status).toBe(400)
        })

        it('responds with 400 when phoneNumber is empty',async ()=>{
            const body = {
                username:'test',
                email:'test@mail.com',
                password:'test123',
                phoneNumber:''
            }
            const response = await request(app).post('/user/register').send(body)
            expect(response.status).toBe(400)
        })
    })

    describe('POST /user/login - login user',()=>{
        it('responds with 200 when success', async()=>{
            const body = {
                email:'jhon@mail.com',
                password:'jhon123',
            }
            const response = await request(app).post('/user/login').send(body)
            expect(response.status).toBe(200)
            expect(response.body).toBeInstanceOf(Object)
        })

        it('responds with 400 when email is empty', async()=>{
            const body = {
                email:'',
                password:'jhon123',
            }
            const response = await request(app).post('/user/login').send(body)
            expect(response.status).toBe(400)
            expect(response.body).toBeInstanceOf(Object)
        })

        it('responds with 400 when password is empty', async()=>{
            const body = {
                email:'jhon@mail.com',
                password:'',
            }
            const response = await request(app).post('/user/login').send(body)
            expect(response.status).toBe(400)
            expect(response.body).toBeInstanceOf(Object)
        })

        it('responds with 401 if email is not registered', async()=>{
            const body = {
                email:'jhon123@mail.com',
                password:'jhon123',
            }
            const response = await request(app).post('/user/login').send(body)
            expect(response.status).toBe(401)
            expect(response.body).toBeInstanceOf(Object)
        })

        it('responds with 401 if password is not registered', async()=>{
            const body = {
                email:'jhon@mail.com',
                password:'jhon',
            }
            const response = await request(app).post('/user/login').send(body)
            expect(response.status).toBe(401)
            expect(response.body).toBeInstanceOf(Object)
        })

    })

    describe('GET /user/items - get all available items',()=>{
        it('responds with 200 and get all items with registered user',async()=>{
            const response = await request(app).get('/user/items?page[size]=5&page[number]=1')
            expect(response.status).toBe(200)
            expect(response.body).toBeInstanceOf(Object)
            expect(response.body).toHaveLength(5)
        })
    })

    describe('GET /user/item/<id> - get single item detail',()=>{
        it('responds with 200 and get single item detail',async()=>{
            const response = await request(app).get('/user/item/1')
            expect(response.status).toBe(200)
            expect(response.body).toBeInstanceOf(Object)
        })

        it('responds with 404 item not exist',async()=>{
            const response = await request(app).get('/user/item/9999')
            expect(response.status).toBe(404)
            expect(response.body).toBeInstanceOf(Object)
        })
    })

    describe('POST /user/item-for-rent - post items in array to rent',()=>{
        it('responds with 201 post items for rent', async()=>{
            const token = signToken(userDataSingle)
            const body = {"items":[
                {
                    "userId" : 3,
                    "itemId" : 1,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-09"
                },{
                    "userId" : 3,
                    "itemId" : 2,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-10"
                }
            ]}
            const response = await request(app).post('/user/item-for-rent').send(body).set('access_token',`Bearer ${token}`)
            expect(response.status).toBe(201)
            expect(response.body).toBeInstanceOf(Object)
            expect(response.body).toHaveProperty('message','Rent process success')
        } )

        it('responds with 401 unauthorized access with random token', async()=>{
            const token = 'wleowleo'
            const body = {"items":[
                {
                    "userId" : 3,
                    "itemId" : 1,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-09"
                },{
                    "userId" : 3,
                    "itemId" : 2,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-10"
                }
            ]}
            const response = await request(app).post('/user/item-for-rent').send(body).set('access_token',`Bearer ${token}`)
            expect(response.status).toBe(401)
            expect(response.body).toBeInstanceOf(Object)
        } )

        it('responds with 404 post items for rent with id not in database', async()=>{
            const token = signToken(userDataSingle)
            const body = {"items":[
                {
                    "userId" : 3,
                    "itemId" : 9999,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-09"
                },{
                    "userId" : 3,
                    "itemId" : 2,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-10"
                }
            ]}
            const response = await request(app).post('/user/item-for-rent').send(body).set('access_token',`Bearer ${token}`)
            expect(response.status).toBe(404)
            expect(response.body).toBeInstanceOf(Object)
           
        } )

        
    })

    describe('PATCH user/return-item/:id - return rented item',()=>{
        it('response 200 return single rented item',async()=>{
            const token = signToken(userDataSingle)
            const body = {"items":[
                {
                    "userId" : 3,
                    "itemId" : 1,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-09"
                },{
                    "userId" : 3,
                    "itemId" : 2,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-10"
                }
            ]}
            const r1 = await request(app).post('/user/item-for-rent').send(body).set('access_token',`Bearer ${token}`)
            const r2 = await request(app).patch('/user/return-item/1').set('access_token',`Bearer ${token}`)
            expect(r2.status).toBe(200)
            expect(r2.body).toBeInstanceOf(Object)
            expect(r2.body).toHaveProperty('message','Item has been returned')
        })

        it('response 401 unauthorized user',async()=>{
            const token = signToken(userDataSingle)
            const wrongToken = 'wleowleo'
            const body = {"items":[
                {
                    "userId" : 3,
                    "itemId" : 1,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-09"
                },{
                    "userId" : 3,
                    "itemId" : 2,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-10"
                }
            ]}
            const r1 = await request(app).post('/user/item-for-rent').send(body).set('access_token',`Bearer ${token}`)
            const r2 = await request(app).patch('/user/return-item/1').set('access_token',`Bearer ${wrongToken}`)
            expect(r2.status).toBe(401)
            expect(r2.body).toBeInstanceOf(Object)
        })

        it('response 404 rented item does not exist',async()=>{
            const token = signToken(userDataSingle)
            const body = {"items":[
                {
                    "userId" : 3,
                    "itemId" : 1,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-09"
                },{
                    "userId" : 3,
                    "itemId" : 2,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-10"
                }
            ]}
            const r1 = await request(app).post('/user/item-for-rent').send(body).set('access_token',`Bearer ${token}`)
            const r2 = await request(app).patch('/user/return-item/9999').set('access_token',`Bearer ${token}`)
            expect(r2.status).toBe(404)
            expect(r2.body).toBeInstanceOf(Object)
        })
    })

    describe('GET user/rented-item - get all rented item from user',()=>{
        it('response 200 get rented item from single user',async()=>{
            const token = signToken(userDataSingle)
            const body = {"items":[
                {
                    "userId" : 3,
                    "itemId" : 1,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-09"
                },{
                    "userId" : 3,
                    "itemId" : 2,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-10"
                }
            ]}
            const body2 = {
                "id":3
            }
            const r1 = await request(app).post('/user/item-for-rent').send(body).set('access_token',`Bearer ${token}`)
            const r2 = await request(app).get('/user/rented-item').send(body2).set('access_token',`Bearer ${token}`)
            expect(r2.status).toBe(200)
            expect(r2.body).toBeInstanceOf(Object)
        })

        it('response 401 unauthorized token',async()=>{
            const token = signToken(userDataSingle)
            const wrongToken = 'wleowleo'
            const body = {"items":[
                {
                    "userId" : 3,
                    "itemId" : 1,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-09"
                },{
                    "userId" : 3,
                    "itemId" : 2,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-10"
                }
            ]}
            const body2 = {
                "id":3
            }
            const r1 = await request(app).post('/user/item-for-rent').send(body).set('access_token',`Bearer ${token}`)
            const r2 = await request(app).get('/user/rented-item').send(body2).set('access_token',`Bearer ${wrongToken}`)
            expect(r2.status).toBe(401)
            expect(r2.body).toBeInstanceOf(Object)
        })

    })
})