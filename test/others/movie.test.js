const chai = require('chai');
const expect = chai.expect;
const bcrypt = require('bcryptjs');
const chaiHttp = require('chai-http');
const app = require('../../app/app');
const { closeDBConnection } = require('../../config/db');
const Movie = require('../../models/movieModel');
const User = require('../../models/userModel');

chai.use(chaiHttp);

const initTestUser = async (email, password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = new User({ email, password: hashedPassword });
  await newUser.save();
  return newUser;
};

describe('Movies basic tests', () => {
  before(done => {
    process.env.NODE_ENV = 'test';
    Promise.all([
      initTestUser('test@mail.com', '123456'),
      Movie.deleteMany({})
    ])
      .then(res => {
        console.log('Initial completed');
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

describe('Movies API Tests', () => {
  let authToken;

  before(() => {
    process.env.NODE_ENV = 'test';
  });

  it('should have app function', () => {
    expect(app).to.be.a('function');
  });

  it('should create a new movie and return 201', (done) => {
    chai.request(app)
      .post('/api/v1/user/login')
      .send({ email: 'test@mail.com', password: '123456' })
      .then(res => {
        authToken = res.body.token;
        return chai.request(app)
          .post('/api/v1/movie')
          .set('authorization', authToken)
          .send({
            title: 'New Film 1',
            url: 'https://www.youtube.com/watch?v=example',
            description: 'Great movie'
          });
      })
      .then(res => {
        expect(res).to.have.status(201);
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should create a new movie and return 201', (done) => {
    chai.request(app)
      .post('/api/v1/user/login')
      .send({ email: 'test@mail.com', password: '123456' })
      .then(res => {
        authToken = res.body.token;
        return chai.request(app)
          .post('/api/v1/movie')
          .set('authorization', authToken)
          .send({
            title: 'New Film 2',
            url: 'https://www.youtube.com/watch?v=example2',
            description: 'Great movie 2'
          });
      })
      .then(res => {
        expect(res).to.have.status(201);
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should return 400 for invalid movie input', (done) => {
    chai.request(app)
      .post('/api/v1/user/login')
      .send({ email: 'test@mail.com', password: '123456' })
      .then(res => {
        authToken = res.body.token;
        return chai.request(app)
          .post('/api/v1/movie')
          .set('authorization', authToken)
          .send({
            title: '',
            url: 'https://www.youtube.com/watch?v=example',
            description: 'Invalid movie'
          });
      })
      .then(res => {
        expect(res).to.have.status(400);
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should return list of movies', (done) => {
    chai.request(app)
      .get('/api/v1/movie')
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.data
          .map(movie => ({ title: movie.title })))
          .to.deep.equal([{ title: 'New Film 2' }, { title: 'New Film 1' }]);
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  after(async () => {
    await User.deleteMany({});
    await closeDBConnection();
    console.log('All tests completed, stopping server....');
    process.exit();
  });
});
