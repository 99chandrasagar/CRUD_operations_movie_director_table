const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initalizeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Error at Database ${e.message}`);
    process.exit(1);
  }
};

initalizeDBAndServer();

const convertDbObjectToResponseObject = (DbObject) => {
  return {
    movieName: DbObject.movie_name,
  };
};

//Returns a list of all movie names in the movie table
app.get("/movies/", async (request, response) => {
  const listOfMovies = request.body;
  const SqlQuery = `
    select 
    *
    from
    movie;`;
  const responseList = await db.all(SqlQuery);
  response.send(
    responseList.map((eachmovie) => convertDbObjectToResponseObject(eachmovie))
  );
});

//Creates a new movie in the movie table. movie_id is auto-incremented
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    insert into
    movie (director_id,movie_name,lead_actor)
    values
    (
        ${directorId},
        '${movieName}',
        '${leadActor}');`;

  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//converts
const converts = (dbobje) => {
  return {
    movieId: dbobje.movie_id,
    directorId: dbobje.director_id,
    movieName: dbobje.movie_name,
    leadActor: dbobje.lead_actor,
  };
};
//Returns a movie based on the movie ID
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const Query = `
    select
    *
    from
    movie
    where movie_id = ${movieId};`;
  const data = await db.get(Query);
  response.send(converts(data));
});

//Updates the details of a movie in the movie table based on the movie ID
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateQuery = `
  update movie
  set
  director_id = ${directorId},
  movie_name = '${movieName}',
  lead_actor = '${leadActor}'
  where movie_id = ${movieId};`;

  await db.run(updateQuery);
  response.send("Movie Details Updated");
});

//Deletes a movie from the movie table based on the movie ID
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    delete from movie
    where movie_id = ${movieId};`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

//converting
const conversionresponse = (dbobject) => {
  return {
    directorId: dbobject.director_id,
    directorName: dbobject.director_name,
  };
};

//Returns a list of all directors in the director table
app.get("/directors/", async (request, response) => {
  const { directorId, directorName } = request.body;
  const getQUery = `
    select * from director;`;
  const details = await db.all(getQUery);
  response.send(details.map((eachdirect) => conversionresponse(eachdirect)));
});

//convertingLast
const convertingLast = (dbob) => {
  return {
    movieName: dbob.movie_name,
  };
};

//Returns a list of all movie names directed by a specific director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const { movieName } = request.body;
  const getQuery = `
    select movie_name from director natural join movie
    where director_id = ${directorId};`;
  const data1 = await db.all(getQuery);
  response.send(data1.map((eachname) => convertingLast(eachname)));
});

module.exports = app;
