const request = require('supertest')
const { app, baseDir} = require('../app')
const { sequelize } = require('../models')
const { hashPassword } = require('../helpers/bcrypt')
const { signToken } = require('../helpers/jwt')
const path =  require('path');
const {cookienize} = require('../helpers/cookies')
// const {server, expressGraceful} = require('../bin/www')



const userDataSingle = {
    email:'hafiz@mail.com'
}

let server, agent;

beforeEach((done) => {
    server = app.listen(3000, (err) => {
      if (err) return done(err);

       agent = request.agent(server); // since the application is already listening, it should use the allocated port
       done();
    });
});

afterEach((done) => {
  return server && server.close(done);
});


beforeAll(async()=>{
    let admins = require('../data/admin.json')
    let userData = require('../data/userdata.json')
    let items = require('../data/items.json')

    admins.forEach(el=>{
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
    await sequelize.queryInterface.bulkInsert('Admins',admins)
    await sequelize.queryInterface.bulkInsert('Items',items)
})

afterAll(async()=>{
    
    await sequelize.queryInterface.bulkDelete('Items',null,{
        truncate:true,
        cascade:true,
        restartIdentity:true
    })
    await sequelize.queryInterface.bulkDelete('Admins',null,{
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

describe('Admin route test',()=>{
    describe('POST /admin/register - register new admin',()=>{
        it('responds with 201 when success', async()=>{
            const body = {
                username:'test',
                email:'test@mail.com',
                password:'test123',
                phoneNumber:'111111111'
            }
            const response = await agent.post('/admin/register').send(body)
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
            const response = await agent.post('/admin/register').send(body)
            expect(response.status).toBe(400)
        })

        it('responds with 400 when same username',async ()=>{
            const body = {
                username:'test',
                email:'testtest@mail.com',
                password:'test123',
                phoneNumber:'111111111'
            }
            const response = await agent.post('/admin/register').send(body)
            expect(response.status).toBe(400)
        })

        it('responds with 400 when email is empty',async ()=>{
            const body = {
                username:'test',
                password:'test123',
                phoneNumber:'111111111'
            }
            const response = await agent.post('/admin/register').send(body)
            expect(response.status).toBe(400)
        })

        it('responds with 400 when email is already registered',async ()=>{
            const body = {
                username:'test',
                email:'jhon@mail.com',
                password:'test123',
                phoneNumber:'111111111'
            }
            const response = await agent.post('/admin/register').send(body)
            expect(response.status).toBe(400)
        })

        it('responds with 400 when password is empty',async ()=>{
            const body = {
                username:'test',
                email:'test@mail.com',
                password:'',
                phoneNumber:'111111111'
            }
            const response = await agent.post('/admin/register').send(body)
            expect(response.status).toBe(400)
        })

        it('responds with 400 when password is less than 5 char length',async ()=>{
            const body = {
                username:'test',
                email:'test@mail.com',
                password:'test',
                phoneNumber:'111111111'
            }
            const response = await agent.post('/admin/register').send(body)
            expect(response.status).toBe(400)
        })

        it('responds with 400 when phoneNumber is empty',async ()=>{
            const body = {
                username:'test',
                email:'test@mail.com',
                password:'test123',
                phoneNumber:''
            }
            const response = await agent.post('/admin/register').send(body)
            expect(response.status).toBe(400)
        })
    })

    describe('POST /admin/login - login admin',()=>{
        it('responds with 200 when success', async()=>{
            const body = {
                email:'hafiz@mail.com',
                password:'hafiz123',
            }
            const response = await agent.post('/admin/login').send(body)
            expect(response.status).toBe(200)
            expect(response.body).toBeInstanceOf(Object)
        })

        it('responds with 400 when email is empty', async()=>{
            const body = {
                email:'',
                password:'hafiz123',
            }
            const response = await agent.post('/admin/login').send(body)
            expect(response.status).toBe(400)
            expect(response.body).toBeInstanceOf(Object)
        })

        it('responds with 400 when password is empty', async()=>{
            const body = {
                email:'jhon@mail.com',
                password:'',
            }
            const response = await agent.post('/admin/login').send(body)
            expect(response.status).toBe(400)
            expect(response.body).toBeInstanceOf(Object)
        })

        it('responds with 401 if email is not registered', async()=>{
            const body = {
                email:'hafiz123@mail.com',
                password:'hafiz123',
            }
            const response = await agent.post('/admin/login').send(body)
            expect(response.status).toBe(401)
            expect(response.body).toBeInstanceOf(Object)
        })

        it('responds with 401 if password is not registered', async()=>{
            const body = {
                email:'hafiz@mail.com',
                password:'jhon',
            }
            const response = await agent.post('/admin/login').send(body)
            expect(response.status).toBe(401)
            expect(response.body).toBeInstanceOf(Object)
        })

    })

    describe('GET /admin/items - get all available items',()=>{
        it('responds with 200 and get all items with registered admin',async()=>{
            const response = await agent.get('/admin/items?page[size]=5&page[number]=1')
            expect(response.status).toBe(200)
            expect(response.body).toBeInstanceOf(Object)
            expect(response.body).toHaveLength(5)
        })
    })

    describe('GET /admin/item/<id> - get single item detail',()=>{
        it('responds with 200 and get single item detail',async()=>{
            const response = await agent.get('/admin/item/1')
            expect(response.status).toBe(200)
            expect(response.body).toBeInstanceOf(Object)
        })

        it('responds with 404 item not exist',async()=>{
            const response = await agent.get('/admin/item/9999')
            expect(response.status).toBe(404)
            expect(response.body).toBeInstanceOf(Object)
        })
    })

    describe('POST /admin/item-for-rent - post items in array to rent',()=>{
        it('responds with 201 post items for rent', async()=>{
            const token = signToken(userDataSingle)
            const cookies = cookienize(token)
            const body = {"items":[
                {
                    "userId" : 1,
                    "itemId" : 1,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-09"
                },{
                    "userId" : 1,
                    "itemId" : 2,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-10"
                }
            ]}
            const response = await agent.post('/admin/item-for-rent').send(body).set('Cookie',[cookies]) 
            expect(response.status).toBe(201)
            expect(response.body).toBeInstanceOf(Object)
            expect(response.body).toHaveProperty('message','Rent process success')
        } )

        it('responds with 401 unauthorized access with random token', async()=>{
            const token = 'wleowleo'
            const cookies = cookienize(token)
            const body = {"items":[
                {
                    "userId" : 1,
                    "itemId" : 1,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-09"
                },{
                    "userId" : 1,
                    "itemId" : 2,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-10"
                }
            ]}
            const response = await agent.post('/admin/item-for-rent').send(body).set('Cookie',[cookies]) 
            expect(response.status).toBe(401)
            expect(response.body).toBeInstanceOf(Object)
        } )

        it('responds with 404 post items for rent with id not in database', async()=>{
            const token = signToken(userDataSingle)
            const cookies = cookienize(token)
            const body = {"items":[
                {
                    "userId" : 1,
                    "itemId" : 9999,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-09"
                },{
                    "userId" : 1,
                    "itemId" : 2,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-10"
                }
            ]}
            const response = await agent.post('/admin/item-for-rent').send(body).set('Cookie',[cookies]) 
            expect(response.status).toBe(404)
            expect(response.body).toBeInstanceOf(Object)
           
        } )

        
    })

    describe('PATCH admin/return-item/:id - return rented item',()=>{
        it('response 200 return single rented item',async()=>{
            const token = signToken(userDataSingle)
            const cookies = cookienize(token)
            const body = {"items":[
                {
                    "userId" : 1,
                    "itemId" : 1,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-09"
                },{
                    "userId" : 1,
                    "itemId" : 2,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-10"
                }
            ]}
            const r1 = await agent.post('/admin/item-for-rent').send(body).set('Cookie',[cookies]) 
            const r2 = await agent.patch('/admin/return-item/1').set('Cookie',[cookies]) 
            expect(r2.status).toBe(200)
            expect(r2.body).toBeInstanceOf(Object)
            expect(r2.body).toHaveProperty('message','Item has been returned')
        })

        it('response 401 unauthorized admin',async()=>{
            const token = signToken(userDataSingle)
            const cookies = cookienize(token)
            const wrongToken = 'wleowleo'
            const cookiesWrong = cookienize(wrongToken)
            const body = {"items":[
                {
                    "userId" : 1,
                    "itemId" : 1,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-09"
                },{
                    "userId" : 1,
                    "itemId" : 2,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-10"
                }
            ]}
            const r1 = await agent.post('/admin/item-for-rent').send(body).set('Cookie',[cookies]) 
            const r2 = await agent.patch('/admin/return-item/1').set('Cookie',[cookiesWrong]) 
            expect(r2.status).toBe(401)
            expect(r2.body).toBeInstanceOf(Object)
        })

        it('response 404 rented item does not exist',async()=>{
            const token = signToken(userDataSingle)
            const cookies = cookienize(token)
            const body = {"items":[
                {
                    "userId" : 1,
                    "itemId" : 1,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-09"
                },{
                    "userId" : 1,
                    "itemId" : 2,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-10"
                }
            ]}
            const r1 = await agent.post('/admin/item-for-rent').send(body).set('Cookie',[cookies]) 
            const r2 = await agent.patch('/admin/return-item/9999').set('Cookie',[cookies]) 
            expect(r2.status).toBe(404)
            expect(r2.body).toBeInstanceOf(Object)
        })
    })

    describe('GET admin/rented-item - get all rented item from admin',()=>{
        it('response 200 get rented item from single admin',async()=>{
            const token = signToken(userDataSingle)
            const cookies = cookienize(token)
            const body = {"items":[
                {
                    "userId" : 1,
                    "itemId" : 1,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-09"
                },{
                    "userId" : 1,
                    "itemId" : 2,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-10"
                }
            ]}
            const body2 = {
                "id":3
            }
            const r1 = await agent.post('/admin/item-for-rent').send(body).set('Cookie',[cookies]) 
            const r2 = await agent.get('/admin/rented-item').send(body2).set('Cookie',[cookies]) 
            expect(r2.status).toBe(200)
            expect(r2.body).toBeInstanceOf(Object)
        })

        it('response 401 unauthorized token',async()=>{
            const token = signToken(userDataSingle)
            const cookies = cookienize(token)
            const wrongToken = 'wleowleo'
            const cookiesWrong = cookienize(wrongToken)
            const body = {"items":[
                {
                    "userId" : 1,
                    "itemId" : 1,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-09"
                },{
                    "userId" : 1,
                    "itemId" : 2,
                    "tanggalPinjam" : "2024-04-08",
                    "tanggalKembali" : "2024-04-10"
                }
            ]}
            const body2 = {
                "id":3
            }
            const r1 = await agent.post('/admin/item-for-rent').send(body).set('Cookie',[cookies]) 
            const r2 = await agent.get('/admin/rented-item').send(body2).set('Cookie', [cookiesWrong])
            expect(r2.status).toBe(401)
            expect(r2.body).toBeInstanceOf(Object)
        })

    })

    describe('POST admin/add-item - post a new item',()=>{
        it('response 201 get rented item from single admin',async()=>{
            const token = signToken(userDataSingle)
            const cookies = cookienize(token)
    
            const r1 = await agent.post('/admin/add-item')
            .field('namaBarang','test')
            .field('jumlah',10)
            .field('kategori','Medis')
            .field('lokasi','TESTEST')
            .field('deskripsi','testest')
            .attach('gambar',path.resolve(baseDir,'./public/items/itemImg-1.jpg'))
            .set('Cookie',[cookies]) 
            expect(r1.status).toBe(201)
            expect(r1.body).toBeInstanceOf(Object)
            expect(r1.body).toHaveProperty('namaBarang','test')
        })

        it('response 401 unauthorized acccess',async()=>{
            const token =''
            const cookies = cookienize(token)

            const r1 = await agent.post('/admin/add-item')
            .set('Cookie',[cookies]) 
            .field('namaBarang','test')
            .field('jumlah',10)
            .field('kategori','Medis')
            .field('lokasi','TESTEST')
            .field('deskripsi','testest')
            
            
            expect(r1.status).toBe(401)
            expect(r1.body).toBeInstanceOf(Object)
            expect(r1.body).toHaveProperty('message','Authentication Error')
        })

        it('response 400 empty nama barang',async()=>{
            const token = signToken(userDataSingle)
            const cookies = cookienize(token)
    
            const r1 = await agent.post('/admin/add-item')
            .field('namaBarang','')
            .field('jumlah',10)
            .field('kategori','Medis')
            .field('lokasi','TESTEST')
            .field('deskripsi','testest')
            .attach('gambar',path.resolve(baseDir,'./public/items/itemImg-1.jpg'))
            .set('Cookie',[cookies]) 
            expect(r1.status).toBe(400)
            expect(r1.body).toBeInstanceOf(Object)
            expect(r1.body).toHaveProperty('message','Please fill in all the blank')
        })

    })

    describe('PUT admin/edit-item/:id - edit single item',()=>{
        it('response 200 edit one item',async()=>{
            const token = signToken(userDataSingle)
            const cookies = cookienize(token)
            const body = {
                namaBarang:"Stetoskop",
                jumlah:10,
                kategori:"Medis",
                lokasi:"RS LALALALA",
                deskripsi:"ini Stetoskop",
                gambar:''
            }
            const r1 = await agent.put('/admin/edit-item/1')
            .field('namaBarang','Stetoskop')
            .field('jumlah',10)
            .field('kategori','Medis')
            .field('lokasi','RS LALALALA')
            .field('deskripsi','ini Stetoskop')
            .set('Cookie',[cookies]) 
            expect(r1.status).toBe(200)
            expect(r1.body).toBeInstanceOf(Object)
            expect(r1.body).toHaveProperty('message','success')
            expect(r1.body).toHaveProperty('data.jumlah',10)
        })

        it('response 401 invalid token',async()=>{
            const token = 'wleoleokljbfvdf'
            const cookies = cookienize(token)
            const body = {
                namaBarang:"Stetoskop",
                jumlah:10,
                kategori:"Medis",
                lokasi:"RS LALALALA",
                deskripsi:"ini Stetoskop",
                gambar:''
            }
            const r1 = await agent.put('/admin/edit-item/1')
            .field('namaBarang','Stetoskop')
            .field('jumlah',10)
            .field('kategori','Medis')
            .field('lokasi','RS LALALALA')
            .field('deskripsi','ini Stetoskop')
            .set('Cookie',[cookies]) 
            expect(r1.status).toBe(401)
            expect(r1.body).toBeInstanceOf(Object)
            expect(r1.body).toHaveProperty('message','Authentication Error')
        })

        it('response 404 item not found',async()=>{
            const token = signToken(userDataSingle)
            const cookies = cookienize(token)
            // const body = {
            //     namaBarang:"Stetoskop",
            //     jumlah:'',
            //     kategori:"Medis",
            //     lokasi:"RS LALALALA",
            //     deskripsi:"ini Stetoskop",
            //     gambar:''
            // }
            const r1 = await agent.put('/admin/edit-item/9999')
            .field('namaBarang','Stetoskop')
            .field('jumlah',10)
            .field('kategori','Medis')
            .field('lokasi','RS LALALALA')
            .field('deskripsi','ini Stetoskop')
            .set('Cookie',[cookies]) 
            expect(r1.status).toBe(404)
            expect(r1.body).toBeInstanceOf(Object)
            expect(r1.body).toHaveProperty('message','Data not found')
        })

        it('response 400 missing namaBarang',async()=>{
            const token = signToken(userDataSingle)
            const cookies = cookienize(token)
           
            const r1 = await agent.put('/admin/edit-item/1')
            .field('namaBarang','')
            .field('jumlah',10)
            .field('kategori','Medis')
            .field('lokasi','RS LALALALA')
            .field('deskripsi','ini Stetoskop')
            .set('Cookie',[cookies]) 
            expect(r1.status).toBe(400)
            expect(r1.body).toBeInstanceOf(Object)
            expect(r1.body).toHaveProperty('message','Please fill in all the blank')
        },40000)

    })

    describe('PUT admin/delete-item/:id - delete single item',()=>{
        it('response 200 delete one item',async()=>{
            const token = signToken(userDataSingle)
            const cookies = cookienize(token)

            const r1 = await agent.delete('/admin/delete-item/20').set('Cookie',[cookies])
            expect(r1.status).toBe(200)
            expect(r1.body).toBeInstanceOf(Object)
            expect(r1.body).toHaveProperty('message','Item has been deleted')

        })

        it('response 401 invalid token',async()=>{
            const token = 'wleolsdrgesrg'
            const cookies = cookienize(token)
            const r1 = await agent.delete('/admin/delete-item/20').set('Cookie',[cookies]) 
            expect(r1.status).toBe(401)
            expect(r1.body).toBeInstanceOf(Object)
            expect(r1.body).toHaveProperty('message','Authentication Error')
        })

        it('response 404 item not found',async()=>{
            const token = signToken(userDataSingle)
            const cookies = cookienize(token)
            
            const r1 = await agent.delete('/admin/delete-item/9999').set('Cookie',[cookies]) 
            
            expect(r1.status).toBe(404)
            expect(r1.body).toBeInstanceOf(Object)
            expect(r1.body).toHaveProperty('message','Data not found')

        })


    })
})