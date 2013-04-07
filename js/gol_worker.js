// This Web Worker is in charge of calculating future generatinos,
// The idea is that these are calculated in the background and then cached,
// so the main GoL widget concentrates only on rendering the cells,
// which is the most demanding task for the cpu.

//The number of generations to compute as a batch before displaying them
var NUM_GENERATIONS = 30;

//An arbitrary constant! Must be >8 ?
var ALIVE = 11;

//The maximum number of neighbors a cell can have
var NUM_NEIGHBORS = 8;

//How long to wait before computing another batch of time-steps.
var DELAY_TIME = 300;

/*
new Ruleset("Conways Original", Arrays.asList(Arrays.asList(3), Arrays.asList(2, 3))),
new Ruleset("Circuit City", Arrays.asList(Arrays.asList(3), Arrays.asList(2, 3, 4))),
new Ruleset("Fractal Circuits", Arrays.asList(Arrays.asList(1, 2), Arrays.asList(2, 3, 4, 5))),
new Ruleset("Crazy Squares", Arrays.asList(Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8), Arrays.asList(0, 1, 2, 3, 4, 5, 6, 7))),
new Ruleset("Crystals", Arrays.asList(Arrays.asList(0, 1, 2, 3, 4, 5, 6, 7), Arrays.asList(0, 1, 2, 4, 5, 6, 7))),
new Ruleset("Round Cells", Arrays.asList(Arrays.asList(5, 6, 7, 8), Arrays.asList(0, 1, 2, 3, 4, 5, 6, 7))),
new Ruleset("Slow Burn", Arrays.asList(Arrays.asList(3, 4), Arrays.asList(4, 5, 6))),
new Ruleset("Slow Burn 2", Arrays.asList(Arrays.asList(3, 4, 7, 8), Arrays.asList(0, 4, 5, 7, 8))),
new Ruleset("Coral", Arrays.asList(Arrays.asList(3), Arrays.asList(2, 3, 4, 5, 6))),
new Ruleset("Amoeba", Arrays.asList(Arrays.asList(3), Arrays.asList(4, 5, 6, 7, 8))),
new Ruleset("Diamonds", Arrays.asList(Arrays.asList(3, 4, 5, 6, 7, 8), Arrays.asList(4, 5, 6, 7))),
*/

var conwayRules = makeRuleArray(false);
conwayRules[0][3] = true;
conwayRules[1][2] = true;
conwayRules[1][3] = true;

var circuitCityRules = makeRuleArray(false);
circuitCityRules[0][3] = true;
circuitCityRules[1][2] = true;
circuitCityRules[1][3] = true;
circuitCityRules[1][4] = true;

var fractalCircuits = makeRuleArray(false);
fractalCircuits[0][1] = true;
fractalCircuits[0][2] = true;
fractalCircuits[1][2] = true;
fractalCircuits[1][3] = true;
fractalCircuits[1][4] = true;
fractalCircuits[1][5] = true;

var crazySquaresRules = makeRuleArray(true);
crazySquaresRules[0][0] = false;
crazySquaresRules[1][8] = false;

var crystalsRules = makeRuleArray(true);
crystalsRules[0][8] = false;
crystalsRules[1][3] = false;
crystalsRules[1][8] = false;

var roundCellRules = makeRuleArray(true);
roundCellRules[0][0] = false;
roundCellRules[0][1] = false;
roundCellRules[0][2] = false;
roundCellRules[0][3] = false;
roundCellRules[0][4] = false;
roundCellRules[1][8] = false;

var coralRules = makeRuleArray(false);
coralRules[0][3] = true;
coralRules[1][2] = true;
coralRules[1][3] = true;
coralRules[1][4] = true;
coralRules[1][5] = true;
coralRules[1][6] = true;

var amoebaRules = makeRuleArray(false);
amoebaRules[0][3] = true;
amoebaRules[1][4] = true;
amoebaRules[1][5] = true;
amoebaRules[1][6] = true;
amoebaRules[1][7] = true;
amoebaRules[1][8] = true;

var diamondsRules = makeRuleArray(true);
diamondsRules[0][0] = false;
diamondsRules[0][1] = false;
diamondsRules[0][2] = false;
diamondsRules[1][0] = false;
diamondsRules[1][1] = false;
diamondsRules[1][2] = false;
diamondsRules[1][3] = false;
diamondsRules[1][8] = false;

//make conway's rules the default when you start.
var rules = conwayRules;

var rulesChanged = false;

function makeRuleArray(def){
    var ruleArray = new Array();
    for(var rx = 0; rx < 2; rx++) {
        ruleArray[rx] = new Array();
        for(var ry = 0; ry <= NUM_NEIGHBORS; ry++)
            ruleArray[rx][ry] = def;
    }

    return ruleArray;
}



var GoL = {
  init: function(size) {
    GoL.size = size;

    GoL.alive      = [];
    GoL.candidates = [];
    GoL.dead       = [];
    GoL.born       = [];

    GoL.initializeGrid(GoL.size, GoL.size);
    GoL.randomnizeGrid();

    GoL.run();
  },

  initializeGrid: function(rows, columns) {
    var grid = new Array(rows);

    for (i = 0; i < rows; i++)
      grid[i] = new Array(columns);

    GoL.grid = grid;
  },

  setRules: function(r) {
    if (r === "Amoeba") {
        rules = amoebaRules;
    }
    else if(r === "Conway's Original"){
        rules = conwayRules;
    }
    else if(r === "Crazy Squares"){
        rules = crazySquaresRules;
    }
    else if(r === "Fractal Circuits"){
        rules = fractalCircuitsRules;
    }
    else if(r === "Circuit City"){
        rules = circuitCityRules;
    }
    else if(r === "Coral"){
        rules = coralRules;
    }
    else if(r === "Diamonds"){
        rules = diamondsRules;
    }
  },


  randomnizeGrid: function() {
    var floor  = Math.floor;
    var random = Math.random;
    var limit  = GoL.size * 25;
    var x, y;

    for (i = 0; i < limit; i++) {
      x = floor(random()*GoL.size);
      y = floor(random()*GoL.size);

      if (GoL.grid[x][y] != ALIVE) {
        GoL.grid[x][y] = ALIVE;
        GoL.alive.push([x,y]);
      }
    }

    // Draw the initial position too.
    postMessage([{ born: GoL.alive, dead: [] }]);
  },

  // Calculate 20 generations at a time,
  // and pass them to the foreground,
  // that way the syncrhonization time between this worker,
  // and the main js is reduced to a 1/10th of the time.
  run: function() {
    setTimeout(GoL.run, DELAY_TIME);

    var generations = [];

    for (i = 0; i < NUM_GENERATIONS; i++) {
      GoL.nextGeneration();
      generations.push({ born: GoL.born, dead: GoL.dead });
    }

    postMessage(generations);
  },

  nextGeneration: function() {
    var i, x, y, neighbours, candidate;

    GoL.candidates = GoL.alive;

    for (i = 0, l = GoL.alive.length; i < l; i++)
      GoL.updateNeighbours(GoL.alive[i]);

    GoL.alive = [];
    GoL.born  = [];
    GoL.dead  = [];

    for (i = 0, l = GoL.candidates.length; i < l; i++) {
      candidate = GoL.candidates[i]; x = candidate[0]; y = candidate[1];
      neighbours = GoL.grid[x][y] % ALIVE;

      if (GoL.grid[x][y] >= ALIVE)
        if (rules[1][neighbours] === false){//neighbours < 2 || neighbours > 3) {
          GoL.dead.push(candidate);
          GoL.grid[x][y] = undefined;
        } else {
          GoL.grid[x][y] = ALIVE;
          GoL.alive.push(candidate);
        }
      else
        if (rules[0][GoL.grid[x][y]] === true){//GoL.grid[x][y] == 3) {
          GoL.grid[x][y] = ALIVE;
          GoL.born.push(candidate);
          GoL.alive.push(candidate);
        } else
          GoL.grid[x][y] = undefined;
    };
  },

  updateNeighbours: function(coord) {
    var row = coord[0], column = coord[1];
    var j, x, y;
    var coords  = [
      [row - 1, column - 1],
      [row - 1, column    ],
      [row - 1, column + 1],
      [row   ,  column - 1],
      [row   ,  column + 1],
      [row + 1, column - 1],
      [row + 1, column    ],
      [row + 1, column + 1]
    ];

    for (j = 0; j < NUM_NEIGHBORS; j++)
      if (coords[j][0] >= 0 && coords[j][0] < GoL.size && coords[j][1] >= 0 && coords[j][1] < GoL.size) {
        x = coords[j][0]; y = coords[j][1];

        if (GoL.grid[x][y])
          GoL.grid[x][y]++;
        else {
          GoL.grid[x][y] = 1;
          GoL.candidates.push(coords[j])
        };
      };
  }
};

onmessage = function(e) {
    if (e.data.size) {
        GoL.init(e.data.size);
    } else {
        GoL.setRules(e.data.new_rule);
        rulesChanged = true;
    }
};

