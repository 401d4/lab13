/* eslint-disable */

process.env.SECRET='test';

const jwt = require('jsonwebtoken');

const server = require('../../../src/app.js').server;
const supergoose = require('../../supergoose.js');
let User = require('../../../src/auth/users-model');

const mockRequest = supergoose(server);

let users = {
  admin: {username: 'admin', password: 'password', role: 'admin'},
  editor: {username: 'editor', password: 'password', role: 'editor'},
  user: {username: 'user', password: 'password', role: 'user'},
};


describe('Auth Router', () => {
  
  Object.keys(users).forEach( userType => {
    
    describe(`${userType} users`, () => {
      
      let encodedToken;
      let id;
      
      it.skip('can create one', () => {
        return mockRequest.post('/signup')
          .send(users[userType])
          .then(results => {
            var token = jwt.verify(results.text, process.env.SECRET);
            id = token.id;
            encodedToken = results.text;
            expect(token.id).toBeDefined();
          });
      });

      let savedToken;
      it.skip('can signin with basic', () => {
        return mockRequest.post('/signin')
          .auth(users[userType].username, users[userType].password)
          .then(results => {
            let token = jwt.verify(results.text, process.env.SECRET);
            expect(token.id).toEqual(id);

            savedToken = results.text;
          });
      });

      it.skip('can sign in with bearer token', async () => {
        expect(savedToken).toBeDefined();
        expect(savedToken).not.toBe('');
  
        let response = await mockRequest
          .post('/signin')
          .set('Authorization', `Bearer ${savedToken}`)
          .expect(200);
  
        var token = jwt.decode(response.text);
        expect(token.id).toEqual(id);
        expect(token.capabilities).toBeDefined();
      })

      it.skip('cannot sign in with bearer token after password is changed', async () => {
        expect(savedToken).toBeDefined();
        expect(savedToken).not.toBe('');
        let savedUser = await User.findOne({ username: users[userType].username });
        await User.findByIdAndUpdate(savedUser._id, { password: 'Turtles!' });
        await mockRequest
          .post('/signin')
          .set('Authorization', `Bearer ${savedToken}`)
          .expect(401);
      })
    });
  })
});