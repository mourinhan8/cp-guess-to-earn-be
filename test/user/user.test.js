const chai = require('chai');
const expect = chai.expect;

const app = require('../../app/app');

//chai-http used to send async requests to our app
const http = require('chai-http');
chai.use(http);

//import User model
const User = require('../../models/userModel');

describe('Users basic tests', () => {
  before(done => {
    //delete all users
    User.find()
      .deleteMany()
      .then(res => {
        console.log('Users removed');
        done();
      })
      .catch(err => {
        console.log(err.message);
      });
  });

  it('Should exists', () => {
    expect(app).to.be.a('function');
  });
});

describe('User registration', () => {
  it('/api/v1/user/register should return 201', done => {
    //mock valid user input
    let user_input = {
      email: 'testuser@gmail.com',
      password: '123456'
    };
    //send /POST request to /api/users/register
    chai
      .request(app)
      .post('/api/v1/user/register')
      .send(user_input)
      .then(res => {
        //validate
        expect(res).to.have.status(201);
        done();
      })
      .catch(err => {
        console.log(err);
      });
  });

  it('/api/v1/user/register should return 400 for invalid input', done => {
    //mock invalid user input
    let user_invalid_input = {
      email: '',
      password: '123456'
    };
    chai
      .request(app)
      .post('/api/v1/user/register')
      .send(user_invalid_input)
      .then(res => {
        //validate
        expect(res).to.have.status(400);
        done();
      })
      .catch(err => {
        console.log(err);
      });
  });
});

describe('User login', () => {
  it('should return 200 and token for valid credentials', done => {
    //mock invalid user input
    const valid_input = {
      email: 'testuser@gmail.com',
      password: '123456'
    };
    chai
      .request(app)
      .post('/api/v1/user/login')
      .send(valid_input)
      .then(res => {
        //assertions
        expect(res).to.have.status(200);
        expect(res.body.token).to.exist;
        done();
      })
      .catch(err => {
        console.log(err.message);
      });
  });

  after(done => {
    //stop app server
    console.log('All tests completed, stopping server....');
    process.exit();
  });
});
