import { Dex } from '@pkmn/dex';

const bulba = Dex.species.get('Bulbasaur');
console.log('Bulba from Dex:', bulba);

async function checkPokeAPI() {
    try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon-species/bulbasaur');
        const data = await res.json();
        const flavorEntry = data.flavor_text_entries.find((e: any) => e.language.name === 'es' || e.language.name === 'en');
        console.log('PokeAPI flavor text:', flavorEntry?.flavor_text?.replace(/\n|\f|\r/g, ' '));
    } catch (err) {
        console.error('PokeAPI error', err);
    }
}
checkPokeAPI();
