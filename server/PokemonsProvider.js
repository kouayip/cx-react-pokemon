const knex = require("./knex/knex");

const PokemonsProvider = {
  getAllPokemons() {
    return knex("pokemon")
      .innerJoin("attaques", "pokemon.numéro", "attaques.pokemon_id")
      .select(["pokemon.*", knex.raw("json_agg(attaques) as attaques")])
      .groupBy("pokemon.numéro", "pokemon.nom")
      .orderBy("pokemon.numéro", "asc");
  },
  getAttaques(id) {
    return knex.select().from("attaques").where("pokemon_id", id);
  },
};

module.exports = PokemonsProvider;
