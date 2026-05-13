import fs from 'fs';
import path from 'path';
import { Dex } from '@pkmn/dex';

const CEBOS_DIR = path.join(__dirname, 'cebos_generados');

function getRarity(pokemonStr: string): number {
    // Normalize string for Dex lookup
    let normalized = pokemonStr
        .replace(/_de_/g, '')
        .replace(/_/g, '')
        .replace(/hisuian=true/g, 'hisui')
        .replace(/galarian=true/g, 'galar')
        .replace(/alolan=true/g, 'alola')
        .replace(/paldean=true/g, 'paldea')
        .toLowerCase();
    
    // Casos especiales manuales donde la DB difiere del nombre en el mod de Minecraft:
    if (normalized === 'nidoranf') normalized = 'nidoranf'; // Nidoran female
    if (normalized === 'nidoranm') normalized = 'nidoranm'; // Nidoran male
    
    const species = Dex.species.get(normalized);
    
    if (!species || !species.exists) {
        console.warn(`[WARNING] No se encontró en la Pokédex: ${pokemonStr} (Buscado como: ${normalized}) -> Default 70%`);
        return 70; // Por defecto lo hacemos común para no romper el balance con cosas raras
    }
    
    const hasPrevo = !!species.prevo;
    const hasEvos = species.evos && species.evos.length > 0;
    const bst = species.bst;
    
    if (!hasPrevo && hasEvos) {
        // Base stage (ej. Charmander, Abra)
        return 70;
    } else if (hasPrevo && hasEvos) {
        // Middle stage (ej. Charmeleon, Kadabra)
        return 20;
    } else if (hasPrevo && !hasEvos) {
        // Final stage (ej. Charizard, Alakazam)
        return 10;
    } else {
        // Single stage (ej. Lapras, Sableye)
        if (bst >= 500) {
            return 10; // Fuerte
        } else {
            return 20; // Débil/Moderado
        }
    }
}

function processFiles() {
    if (!fs.existsSync(CEBOS_DIR)) {
        console.error(`Directory ${CEBOS_DIR} not found.`);
        return;
    }

    const files = fs.readdirSync(CEBOS_DIR).filter(f => f.endsWith('.json'));

    for (const file of files) {
        const filePath = path.join(CEBOS_DIR, file);
        console.log(`\nProcesando: ${file}...`);
        
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Recolectar todos los pokemons de los chances actuales
        const allPokemons = new Set<string>();
        for (const chanceBlock of data.filterPokemons.pokemonsChances) {
            for (const pkm of chanceBlock.pokemons) {
                allPokemons.add(pkm);
            }
        }
        
        const commonPool: string[] = [];
        const uncommonPool: string[] = [];
        const rarePool: string[] = [];
        
        for (const pkm of allPokemons) {
            const rarity = getRarity(pkm);
            if (rarity === 70) commonPool.push(pkm);
            else if (rarity === 20) uncommonPool.push(pkm);
            else if (rarity === 10) rarePool.push(pkm);
        }
        
        // Reconstruir el arreglo de pokemonsChances
        const newChances = [];
        if (commonPool.length > 0) newChances.push({"pokemons": commonPool, "chance": 70.0});
        if (uncommonPool.length > 0) newChances.push({"pokemons": uncommonPool, "chance": 20.0});
        if (rarePool.length > 0) newChances.push({"pokemons": rarePool, "chance": 10.0});
        
        data.filterPokemons.pokemonsChances = newChances;
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`✅ Arreglado y guardado: ${file}`);
        console.log(`   Comunes (70%): ${commonPool.length} | Poco Comunes (20%): ${uncommonPool.length} | Raros (10%): ${rarePool.length}`);
    }
}

processFiles();
