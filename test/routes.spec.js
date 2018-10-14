const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../app');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

chai.use(chaiHttp);

describe('Client Routes', () => {
  it('should return the homepage with text', done => {
    chai.request(server)
    .get('/')
    .end((err, response) => {
      response.should.have.status(200);
      response.should.be.html;
      response.res.text.should.equal('Welcome to Quantified Self!');
      done();
    });
  });

  it('should return a 404 for a route that does not exist', done => {
    chai.request(server)
    .get('/sad')
    .end((err, response) => {
      response.should.have.status(404);
      done();
    });
  });
});

describe('API Routes', () => {
  before((done) => {
  database.migrate.latest()
    .then(() => done())
    .catch(error => {
      throw error;
    });
  });

  beforeEach((done) => {
  database.seed.run()
    .then(() => done())
    .catch(error => {
      throw error;
    });
  });

  describe('GET /api/v1/foods', () => {
    it('should return all foods', done => {
      chai.request(server)
        .get('/api/v1/foods')
        .end((err, response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.a('array');
          response.body.length.should.equal(5);
          // first record
          response.body[0].should.have.property('name');
          response.body[0].name.should.equal('Apple');
          response.body[0].should.have.property('calories');
          response.body[0].calories.should.equal('10');
          // last record
          response.body[4].should.have.property('name');
          response.body[4].name.should.equal('Plum');
          response.body[4].should.have.property('calories');
          response.body[4].calories.should.equal('50');
          done();
        });
    });
  });

  describe('POST /api/v1/foods', () => {
    it('should create a new food', done => {
      chai.request(server)
        .post('/api/v1/foods')
        .send({
          name: 'DragonFruit',
          calories: '10'
        })
        .end((err, response) => {
          response.should.have.status(201);
          response.body.should.be.a('object');
          response.body.should.have.property('id');
          done();
        });
    });

    it('should not create a record with missing data', done => {
      chai.request(server)
        .post('/api/v1/foods')
        .send({
          name: 'DragonFruit' 
        })
        .end((err, response) => {
          response.should.have.status(422);
          response.body.error.should.equal(
            `Expected format: { name: <String>, calories: <String> }. You're missing a "calories" property.`
          );
          done();
        });
    });
  });
});