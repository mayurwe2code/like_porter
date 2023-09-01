// import all the things we need  
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import mongoose  from 'mongoose'
import User from'./models/User.js'
export default function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID:'390849855878-a9ba6f6fu36pk48s6serjkq0ej2sqbfv.apps.googleusercontent.com',
        clientSecret: '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',
        callbackURL: '/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        //get the user data from google 
        console.log("profile---------16")
        console.log(profile)
        const newUser = {
          googleId: profile.id,
          displayName: profile.displayName,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          image: profile.photos[0].value,
          email: profile.emails[0].value
        }

        try {
          //find the user in our database 
          let user = await User.findOne({ googleId: profile.id })
console.log("user-----------28")
console.log(user)
          if (user) {
            //If user present in our database.
            done(null, user)
          } else {
            // if user is not preset in our database save user data to database.
            user = await User.create(newUser)
            done(null, user)
          }
        } catch (err) {
          console.error(err)
        }
      }
    )
  )

  // used to serialize the user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  // used to deserialize the user
  passport.deserializeUser(async(id, done) => {
    console.log("_____________id_________")
    console.log(id)
   var rstt =  await User.findById(id)
   console.log("_____________55_________")
   console.log(rstt)
   var err = ''
    done(err,rstt)
})
}
