import json
import os
import pandas as pd

# Nombre del archivo excel que quieres leer (debe estar en la misma carpeta)
EXCEL_FILENAME = "Poolsbeta (1).xlsx"

# Colores por defecto para el displayname
COLORS = {
    "volcan": "<red>",
    "pradera": "<green>",
    "tundra": "<aqua>",
    "oceano": "<blue>",
    "bosque": "<dark_green>"
}

# Caracteres especiales para el título (Small Caps)
SMALL_CAPS = {
    'A': 'ᴀ', 'B': 'ʙ', 'C': 'ᴄ', 'D': 'ᴅ', 'E': 'ᴇ', 'F': 'ғ', 'G': 'ɢ',
    'H': 'ʜ', 'I': 'ɪ', 'J': 'ᴊ', 'K': 'ᴋ', 'L': 'ʟ', 'M': 'ᴍ', 'N': 'ɴ',
    'O': 'ᴏ', 'P': 'ᴘ', 'Q': 'ǫ', 'R': 'ʀ', 'S': 's', 'T': 'ᴛ', 'U': 'ᴜ',
    'V': 'ᴠ', 'W': 'ᴡ', 'X': 'x', 'Y': 'ʏ', 'Z': 'ᴢ'
}

def to_small_caps(text):
    return ''.join(SMALL_CAPS.get(char, char) for char in text.upper())

def generar_jsons():
    # Diccionario para agrupar los Pokemon por Incienso
    pools = {}

    try:
        # Usamos pandas para leer el archivo xlsx ya que csv.DictReader no soporta Excel binario
        df = pd.read_excel(EXCEL_FILENAME)
        for _, row in df.iterrows():
            incienso = str(row['Incienso']).strip()
            pokemon = str(row['Pokemon']).strip().lower().replace("'", "").replace(" ", "_")
            
            if incienso not in pools:
                pools[incienso] = []
            pools[incienso].append(pokemon)
            
    except FileNotFoundError:
        print(f"No se encontró el archivo: {EXCEL_FILENAME}")
        return
    except Exception as e:
        print(f"Error leyendo el archivo excel: {e}")
        return

    # Crear la carpeta de salida
    if not os.path.exists("cebos_generados"):
        os.makedirs("cebos_generados")

    # Generar un JSON por cada Incienso
    for incienso, pokemons in pools.items():
        incienso_id = incienso.lower()
        title_sc = to_small_caps(incienso)
        color = COLORS.get(incienso_id, "<gold>")
        
        # Dividir los pokemon en 3 bloques arbitrarios (60% comunes, 30% poco comunes, 10% raros)
        total = len(pokemons)
        c_count = max(1, int(total * 0.6))
        u_count = int(total * 0.3)
        
        common_pool = pokemons[:c_count]
        uncommon_pool = pokemons[c_count:c_count+u_count]
        rare_pool = pokemons[c_count+u_count:]
        
        pokemonsChances = []
        if common_pool:
            pokemonsChances.append({"pokemons": common_pool, "chance": 70.0})
        if uncommon_pool:
            pokemonsChances.append({"pokemons": uncommon_pool, "chance": 20.0})
        if rare_pool:
            pokemonsChances.append({"pokemons": rare_pool, "chance": 10.0})
        
        # Plantilla base inspirada en volcan.json
        data = {
            "id": incienso_id,
            "title": f"[ᴄᴇʙᴏ] {title_sc}",
            "illusion": True,
            "range": 10,
            "duration": 1200,
            "cooldown": 1300,
            "distance": 8,
            "minLevel": 15,
            "maxLevel": 30,
            "shinyRate": 8192,
            "maxPokemons": 2,
            "spawnCooldown": 30,
            "sound": {
                "variousPlayers": False,
                "sound": "minecraft:entity.fox.death",
                "range": 16.0,
                "volume": 1.0,
                "pitch": 1.0
            },
            "particle": {
                "particle": "minecraft:flame" if incienso_id == "volcan" else "minecraft:happy_villager",
                "numberParticles": 25,
                "offsetX": 1,
                "offsetY": 1,
                "offsetZ": 1,
                "speed": 0,
                "radius": 32.0
            },
            "display": {
                "slot": -1,
                "slots": [],
                "item": "minecraft:emerald",
                "displayname": f"<white><gray>[<yellow>ᴄᴇʙᴏ<gray>] {color}{title_sc}",
                "lore": [
                    "&eAñade este &dᴄᴇʙᴏ&e a una",
                    "&f喇&e y aparecerán",
                    "&ePKMs salvajes"
                ],
                "CustomModelData": 1,
                "nbt": "{CustomModelData:1}"
            },
            "filterPokemons": {
                "blackList": {
                    "onlyImplemented": True,
                    "allowEvolutions": False,
                    "properties": [],
                    "pokemons": [
                        "egg",
                        "pokestop"
                    ],
                    "forms": [],
                    "aspects": [],
                    "labels": [
                        "legendary",
                        "mythical",
                        "ultra_beast"
                    ],
                    "types": [],
                    "rarities": [],
                    "persistentDataMap": {
                        "example_1": [
                            "example_value_1",
                            "example_value_2"
                        ],
                        "example_2": [
                            1.0,
                            2.0,
                            3.0
                        ]
                    },
                    "eggGroups": []
                },
                "useChances": True,
                "pokemonsChances": pokemonsChances,
                "legendarys": False
            }
        }

        # Guardar archivo
        filepath = f"cebos_generados/{incienso_id}.json"
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"Generado exitosamente: {filepath}")

if __name__ == "__main__":
    generar_jsons()