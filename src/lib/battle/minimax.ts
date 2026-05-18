import { BattleState, PokemonState, calculateHeuristicDamage, getTypeEffectiveness } from "./engine";

/**
 * Evalúa heurísticamente la calidad de un estado para el jugador A en comparación con el jugador B.
 * Devuelve un valor numérico donde valores mayores significan que el jugador A está ganando.
 */
export function evaluateState(state: BattleState): number {
  let score = 0;

  const sideA = state.sideA;
  const sideB = state.sideB;

  // 1. Ponderación de HP total de los equipos
  const getTeamHpScore = (pokemon: PokemonState[]) => {
    return pokemon.reduce((sum, p) => sum + (p.currentHp / p.maxHp) * 100, 0);
  };
  score += getTeamHpScore(sideA.pokemon) - getTeamHpScore(sideB.pokemon);

  // 2. Ventaja de los Pokémon activos
  const activeA = sideA.pokemon[sideA.activeIdx];
  const activeB = sideB.pokemon[sideB.activeIdx];

  if (activeA && activeB) {
    // Si el Pokémon activo de A supera en velocidad al de B, tiene ventaja táctica
    const speedA = activeA.stats.spe;
    const speedB = activeB.stats.spe;
    if (speedA > speedB) score += 10;
    else if (speedB > speedA) score -= 10;

    // Ventaja de tipos mutua de los tipos base
    const effectivenessAtoB = getTypeEffectiveness(activeA.types[0], activeB.types);
    const effectivenessBtoA = getTypeEffectiveness(activeB.types[0], activeA.types);
    score += (effectivenessAtoB - effectivenessBtoA) * 15;
  }

  // 3. Hazards en el campo (Stealth Rock, Spikes)
  if (sideA.stealthRock) score -= 8;
  score -= sideA.spikesLayers * 6;

  if (sideB.stealthRock) score += 8;
  score += sideB.spikesLayers * 6;

  // 4. Pantallas / Viento afín (Tailwind) activos
  if (sideA.tailwindTurns > 0) score += 15;
  if (sideA.lightScreenTurns > 0) score += 10;
  if (sideA.reflectTurns > 0) score += 10;

  if (sideB.tailwindTurns > 0) score -= 15;
  if (sideB.lightScreenTurns > 0) score -= 10;
  if (sideB.reflectTurns > 0) score -= 10;

  return score;
}

export interface BattleDecision {
  actionType: "move" | "switch";
  index: number; // Índice del movimiento (0-3) o del Pokémon a cambiar en la banca (0-5)
  score: number;
}

/**
 * Algoritmo Minimax con Poda Alfa-Beta para determinar la mejor jugada inmediata en batalla.
 * - alpha: El mejor score garantizado para el maximizador (jugador A).
 * - beta: El mejor score garantizado para el minimizador (jugador B).
 * - depth: Límite de profundidad (normalmente 2 o 3 para asegurar velocidad web).
 */
export function alphaBetaMinimax(
  state: BattleState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): BattleDecision {
  // Caso base: profundidad alcanzada o estado terminal
  const isTerminal =
    state.sideA.pokemon.every((p) => p.currentHp <= 0) ||
    state.sideB.pokemon.every((p) => p.currentHp <= 0);

  if (depth === 0 || isTerminal) {
    return {
      actionType: "move",
      index: -1,
      score: evaluateState(state),
    };
  }

  const activeSide = isMaximizing ? state.sideA : state.sideB;
  const targetSide = isMaximizing ? state.sideB : state.sideA;

  const activePoke = activeSide.pokemon[activeSide.activeIdx];
  const targetPoke = targetSide.pokemon[targetSide.activeIdx];

  // Generar posibles jugadas válidas
  const possibleMoves: BattleDecision[] = [];

  // A. Movimientos de ataque del Pokémon activo
  if (activePoke && activePoke.currentHp > 0) {
    // Simulamos 4 movimientos genéricos de ataque rápido para evaluación heurística
    const genericMoves = [
      { name: "Ataque Primario", type: activePoke.types[0], basePower: 80, category: "Physical" as const },
      { name: "Ataque Cobertura", type: activePoke.types[1] || activePoke.types[0], basePower: 90, category: "Special" as const },
      { name: "Ataque Potente", type: activePoke.types[0], basePower: 120, category: "Physical" as const },
      { name: "Ataque Rápido", type: "Normal", basePower: 40, category: "Physical" as const },
    ];

    genericMoves.forEach((m, idx) => {
      // Calcular daño estimado
      const dmg = calculateHeuristicDamage(activePoke, targetPoke, m, state.weather);
      // Simular cambio de estado simplificado
      const nextHp = Math.max(0, targetPoke.currentHp - dmg.average);
      
      // Crear estado simulado mutado superficialmente
      const nextState: BattleState = JSON.parse(JSON.stringify(state));
      if (isMaximizing) {
        nextState.sideB.pokemon[nextState.sideB.activeIdx].currentHp = nextHp;
      } else {
        nextState.sideA.pokemon[nextState.sideA.activeIdx].currentHp = nextHp;
      }

      possibleMoves.push({
        actionType: "move",
        index: idx,
        score: evaluateState(nextState),
      });
    });
  }

  // B. Cambios a Pokémon saludables en la banca
  activeSide.pokemon.forEach((p, idx) => {
    if (idx !== activeSide.activeIdx && p.currentHp > 0) {
      const nextState: BattleState = JSON.parse(JSON.stringify(state));
      if (isMaximizing) {
        nextState.sideA.activeIdx = idx;
      } else {
        nextState.sideB.activeIdx = idx;
      }

      possibleMoves.push({
        actionType: "switch",
        index: idx,
        score: evaluateState(nextState),
      });
    }
  });

  // Si no hay jugadas posibles, retornar el estado actual
  if (possibleMoves.length === 0) {
    return {
      actionType: "move",
      index: -1,
      score: evaluateState(state),
    };
  }

  // Ordenar movimientos heurísticamente para optimizar la poda Alfa-Beta
  if (isMaximizing) {
    possibleMoves.sort((a, b) => b.score - a.score);
  } else {
    possibleMoves.sort((a, b) => a.score - b.score);
  }

  let bestMove = possibleMoves[0];

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of possibleMoves) {
      // Simular recursivamente
      const nextState: BattleState = JSON.parse(JSON.stringify(state));
      if (move.actionType === "switch") {
        nextState.sideA.activeIdx = move.index;
      } else if (activePoke && targetPoke) {
        const dummyMove = { name: "Attack", type: activePoke.types[0], basePower: 80, category: "Physical" as const };
        const dmg = calculateHeuristicDamage(activePoke, targetPoke, dummyMove, state.weather);
        nextState.sideB.pokemon[nextState.sideB.activeIdx].currentHp = Math.max(0, targetPoke.currentHp - dmg.average);
      }

      const val = alphaBetaMinimax(nextState, depth - 1, alpha, beta, false);
      if (val.score > maxEval) {
        maxEval = val.score;
        bestMove = { actionType: move.actionType, index: move.index, score: maxEval };
      }
      alpha = Math.max(alpha, val.score);
      if (beta <= alpha) {
        break; // Poda Beta
      }
    }
    return bestMove;
  } else {
    let minEval = Infinity;
    for (const move of possibleMoves) {
      const nextState: BattleState = JSON.parse(JSON.stringify(state));
      if (move.actionType === "switch") {
        nextState.sideB.activeIdx = move.index;
      } else if (activePoke && targetPoke) {
        const dummyMove = { name: "Attack", type: targetPoke.types[0], basePower: 80, category: "Physical" as const };
        const dmg = calculateHeuristicDamage(targetPoke, activePoke, dummyMove, state.weather);
        nextState.sideA.pokemon[nextState.sideA.activeIdx].currentHp = Math.max(0, activePoke.currentHp - dmg.average);
      }

      const val = alphaBetaMinimax(nextState, depth - 1, alpha, beta, true);
      if (val.score < minEval) {
        minEval = val.score;
        bestMove = { actionType: move.actionType, index: move.index, score: minEval };
      }
      beta = Math.min(beta, val.score);
      if (beta <= alpha) {
        break; // Poda Alfa
      }
    }
    return bestMove;
  }
}
