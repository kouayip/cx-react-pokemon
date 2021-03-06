const express = require("express");
const PORT = process.argv[2] || 3001;
const knex = require("./knex/knex");
const bodyParser = require("body-parser");
const Provider = require("./PokemonsProvider");

let cors = require("cors");
const app = express();
let jsonParser = bodyParser.json();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("Welcome on the pokedex API!");
});

//? Yves
//* Get all pokemons
app.get("/pokemons", (req, res) => {
  Provider.getAllPokemons()
    .then((results) => {
      res.json(results);
    })
    .catch(function (err) {
      res.status(500).json({
        error: true,
        message: err.message,
      });
    });
});

//? Jean
//* Get pokemon match to id
app.get("/pokemons/:id", (req, res) => {
  //TODO: Update query request... || join
  knex("pokemon")
    .where({ numéro: req.params.id })
    .then(function (collection) {
      const pokemon = collection[0];
      return knex("attaques")
        .where({ pokemon_id: req.params.id })
        .then(function (data) {
          pokemon.attaques = data;
          return res.json(pokemon);
        })
        .catch(function (err) {
          res.status(500).json({
            error: true,
            data: {
              message: err.message,
            },
          });
        });
    })
    .catch(function (err) {
      res.status(500).json({
        error: true,
        data: {
          message: err.message,
        },
      });
    });
});

//?Jean
//* Insert all pokemons
app.post("/pokemons", jsonParser, (req, res) => {
  //TODO: post pokemon and post attaques
  const pokemon = [];
  const dataAttaques = [];
  const { attaques, ...data } = req.body;
  pokemon.push(data);
  attaques.forEach((att) => {
    att.pokemon_id = data.numéro || data.numero;
    dataAttaques.push(att);
  });

  knex("pokemon")
    .then(function () {
      return knex("pokemon").insert(pokemon);
    })
    .then(function () {
      return knex("attaques").insert(dataAttaques);
    })
    .then(() => {
      return res.status(200).json({
        message: `${pokemon[0].nom} has been added successfully into the pokedex!`,
        pokemon: { ...pokemon[0], attaques: dataAttaques },
      });
    })
    .catch(function (err) {
      res.status(500).json({
        error: true,
        data: {
          message: err.message,
        },
      });
    });
});

//?Yves
//TODO: request method PUT
app.put("/pokemons/:id", jsonParser, (req, res) => {
  //TODO: post pokemon and post attaques
  const dataAttaques = [];
  const { attaques, ...pokemon } = req.body;

  knex("pokemon")
    .then(function () {
      return knex("pokemon").update(pokemon).where("numéro", req.params.id);
    })
    .then(() => {
      return res.status(200).json({
        message: `${pokemon.nom} has been added successfully into the pokedex!`,
        pokemon: { ...pokemon, attaques: dataAttaques },
      });
    })
    .catch(function (err) {
      res.status(500).json({
        error: true,
        data: {
          message: err.message,
        },
      });
    });
});

//?Jean
//TODO: request method DELETE
app.delete("/pokemons/:id", (req, res) => {
  let id = req.params.id;
  knex("attaques")
    .where({ pokemon_id: id })
    .del()
    .then(() => {
      return knex("pokemon")
        .where({ numéro: id })
        .del()
        .then(() =>
          res.status(200).json({ message: "Pokemon successfully deleted !" })
        );
    })
    .catch(function (err) {
      res.status(500).json({
        error: true,
        data: {
          message: err.message,
        },
      });
    });
});

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
