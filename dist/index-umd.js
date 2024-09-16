(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["tournament-pairings"] = {}));
})(this, (function (exports) { 'use strict';

    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const z = Math.floor(Math.random() * (i + 1));
            [a[i], a[z]] = [a[z], a[i]];
        }
        return a;
    }

    function SingleElimination(players, startingRound = 1, consolation = false, ordered = false) {
        const matches = [];
        let playerArray = [];
        if (Array.isArray(players)) {
            playerArray = ordered ? players : shuffle(players);
        }
        else {
            playerArray = [...new Array(players)].map((_, i) => i + 1);
        }
        const exponent = Math.log2(playerArray.length);
        const remainder = Math.round(2 ** exponent) % (2 ** Math.floor(exponent));
        const bracket = exponent < 2 ? [1, 2] : [1, 4, 2, 3];
        for (let i = 3; i <= Math.floor(exponent); i++) {
            for (let j = 0; j < bracket.length; j += 2) {
                bracket.splice(j + 1, 0, 2 ** i + 1 - bracket[j]);
            }
        }
        let round = startingRound;
        if (remainder !== 0) {
            for (let i = 0; i < remainder; i++) {
                matches.push({
                    round: round,
                    match: i + 1,
                    player1: null,
                    player2: null
                });
            }
            round++;
        }
        let matchExponent = Math.floor(exponent) - 1;
        let iterated = false;
        do {
            for (let i = 0; i < 2 ** matchExponent; i++) {
                matches.push({
                    round: round,
                    match: i + 1,
                    player1: null,
                    player2: null
                });
            }
            if (!iterated) {
                iterated = true;
            }
            else {
                matches.filter(m => m.round === round - 1).forEach(m => m.win = {
                    round: round,
                    match: Math.ceil(m.match / 2)
                });
            }
            round++;
            matchExponent--;
        } while (round < startingRound + Math.ceil(exponent));
        const startRound = startingRound + (remainder === 0 ? 0 : 1);
        matches.filter(m => m.round === startRound).forEach((m, i) => {
            m.player1 = playerArray[bracket[2 * i] - 1];
            m.player2 = playerArray[bracket[2 * i + 1] - 1];
        });
        if (remainder !== 0) {
            matches.filter(m => m.round === startingRound).forEach((m, i) => {
                m.player1 = playerArray[2 ** Math.floor(exponent) + i];
                const p2 = playerArray[2 ** Math.floor(exponent) - i - 1];
                const nextMatch = matches.filter(n => n.round === startingRound + 1).find(n => n.player1 === p2 || n.player2 === p2);
                if (nextMatch.player1 === p2) {
                    nextMatch.player1 = null;
                }
                else {
                    nextMatch.player2 = null;
                }
                m.player2 = p2;
                m.win = {
                    round: startingRound + 1,
                    match: nextMatch.match
                };
            });
        }
        if (consolation) {
            const lastRound = matches.reduce((max, curr) => Math.max(max, curr.round), 0);
            const lastMatch = matches.filter(m => m.round === lastRound).reduce((max, curr) => Math.max(max, curr.match), 0);
            matches.push({
                round: lastRound,
                match: lastMatch + 1,
                player1: null,
                player2: null
            });
            matches.filter(m => m.round === lastRound - 1).forEach(m => m.loss = {
                round: lastRound,
                match: lastMatch + 1
            });
        }
        return matches;
    }

    function DoubleElimination(players, startingRound = 1, ordered = false) {
        const matches = [];
        let playerArray = [];
        if (Array.isArray(players)) {
            playerArray = ordered ? players : shuffle(players);
        }
        else {
            playerArray = [...new Array(players)].map((_, i) => i + 1);
        }
        const exponent = Math.log2(playerArray.length);
        const remainder = Math.round(2 ** exponent) % (2 ** Math.floor(exponent));
        const bracket = [1, 4, 2, 3];
        for (let i = 3; i <= Math.floor(exponent); i++) {
            for (let j = 0; j < bracket.length; j += 2) {
                bracket.splice(j + 1, 0, 2 ** i + 1 - bracket[j]);
            }
        }
        let round = startingRound;
        if (remainder !== 0) {
            for (let i = 0; i < remainder; i++) {
                matches.push({
                    round: round,
                    match: i + 1,
                    player1: null,
                    player2: null
                });
            }
            round++;
        }
        let matchExponent = Math.floor(exponent) - 1;
        let iterated = false;
        do {
            for (let i = 0; i < 2 ** matchExponent; i++) {
                matches.push({
                    round: round,
                    match: i + 1,
                    player1: null,
                    player2: null
                });
            }
            if (!iterated) {
                iterated = true;
            }
            else {
                matches.filter(m => m.round === round - 1).forEach(m => m.win = {
                    round: round,
                    match: Math.ceil(m.match / 2)
                });
            }
            round++;
            matchExponent--;
        } while (round < startingRound + Math.ceil(exponent));
        const startRound = startingRound + (remainder === 0 ? 0 : 1);
        matches.filter(m => m.round === startRound).forEach((m, i) => {
            m.player1 = playerArray[bracket[2 * i] - 1];
            m.player2 = playerArray[bracket[2 * i + 1] - 1];
        });
        if (remainder !== 0) {
            matches.filter(m => m.round === startingRound).forEach((m, i) => {
                m.player1 = playerArray[2 ** Math.floor(exponent) + i];
                const p2 = playerArray[2 ** Math.floor(exponent) - i - 1];
                const nextMatch = matches.filter(n => n.round === startingRound + 1).find(n => n.player1 === p2 || n.player2 === p2);
                if (nextMatch.player1 === p2) {
                    nextMatch.player1 = null;
                }
                else {
                    nextMatch.player2 = null;
                }
                m.player2 = p2;
                m.win = {
                    round: startingRound + 1,
                    match: nextMatch.match
                };
            });
        }
        matches.push({
            round: round,
            match: 1,
            player1: null,
            player2: null,
        });
        matches.find(m => m.round === round - 1).win = {
            round: round,
            match: 1
        };
        round++;
        const roundDiff = round - 1;
        if (remainder !== 0) {
            if (remainder <= 2 ** Math.floor(exponent) / 2) {
                for (let i = 0; i < remainder; i++) {
                    matches.push({
                        round: round,
                        match: i + 1,
                        player1: null,
                        player2: null
                    });
                }
                round++;
            }
            else {
                for (let i = 0; i < remainder - 2 ** (Math.floor(exponent) - 1); i++) {
                    matches.push({
                        round: round,
                        match: i + 1,
                        player1: null,
                        player2: null
                    });
                }
                round++;
                for (let i = 0; i < 2 ** (Math.floor(exponent) - 1); i++) {
                    matches.push({
                        round: round,
                        match: i + 1,
                        player1: null,
                        player2: null
                    });
                }
                round++;
            }
        }
        let loserExponent = Math.floor(exponent) - 2;
        do {
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 2 ** loserExponent; j++) {
                    matches.push({
                        round: round,
                        match: j + 1,
                        player1: null,
                        player2: null
                    });
                }
                round++;
            }
            loserExponent--;
        } while (loserExponent > -1);
        const fillPattern = (matchCount, fillCount) => {
            const a = [...new Array(matchCount)].map((_, i) => i + 1);
            const c = fillCount % 4;
            const x = a.slice(0, a.length / 2);
            const y = a.slice(a.length / 2);
            return c === 0 ? a : c === 1 ? a.reverse() : c === 2 ? x.reverse().concat(y.reverse()) : y.concat(x);
        };
        let fillCount = 0;
        let winRound = startingRound;
        let loseRound = roundDiff + 1;
        if (remainder === 0) {
            const winMatches = matches.filter(m => m.round === winRound);
            const fill = fillPattern(winMatches.length, fillCount);
            fillCount++;
            let counter = 0;
            matches.filter(m => m.round === loseRound).forEach(m => {
                for (let i = 0; i < 2; i++) {
                    const match = winMatches.find(m => m.match === fill[counter]);
                    match.loss = {
                        round: m.round,
                        match: m.match
                    };
                    counter++;
                }
            });
            winRound++;
            loseRound++;
        }
        else if (remainder <= 2 ** Math.floor(exponent) / 2) {
            let winMatches = matches.filter(m => m.round === winRound);
            let fill = fillPattern(winMatches.length, fillCount);
            fillCount++;
            matches.filter(m => m.round === loseRound).forEach((m, i) => {
                const match = winMatches.find(m => m.match === fill[i]);
                match.loss = {
                    round: m.round,
                    match: m.match
                };
            });
            winRound++;
            loseRound++;
            winMatches = matches.filter(m => m.round === winRound);
            fill = fillPattern(winMatches.length, fillCount);
            fillCount++;
            let countA = 0;
            let countB = 0;
            let routeNumbers = matches.filter(m => m.round === 2 && (m.player1 === null || m.player2 === null)).map(m => Math.ceil(m.match / 2));
            let routeCopy = [...routeNumbers];
            matches.filter(m => m.round === loseRound).forEach(m => {
                for (let i = 0; i < 2; i++) {
                    const match = winMatches.find(m => m.match === fill[countA]);
                    if (routeCopy.some(n => n === m.match)) {
                        const lossMatch = matches.filter(x => x.round === loseRound - 1)[countB];
                        countB++;
                        match.loss = {
                            round: lossMatch.round,
                            match: lossMatch.match
                        };
                        routeCopy.splice(routeCopy.indexOf(m.match), 1);
                    }
                    else {
                        match.loss = {
                            round: m.round,
                            match: m.match
                        };
                    }
                    countA++;
                }
            });
            winRound++;
            loseRound++;
            matches.filter(m => m.round === roundDiff + 1).forEach((m, i) => {
                const match = matches.find(x => x.round === m.round + 1 && x.match === routeNumbers[i]);
                m.win = {
                    round: match.round,
                    match: match.match
                };
            });
        }
        else {
            const winMatches = matches.filter(m => m.round === winRound);
            const loseMatchesA = matches.filter(m => m.round === loseRound);
            loseRound++;
            const loseMatchesB = matches.filter(m => m.round === loseRound);
            const fill = fillPattern(winMatches.length, fillCount);
            fillCount++;
            let countA = 0;
            let countB = 0;
            let routeNumbers = matches.filter(m => m.round === 2 && m.player1 === null && m.player2 === null).map(m => m.match);
            loseMatchesB.forEach(m => {
                const winMatchA = winMatches.find(x => x.match === fill[countA]);
                if (routeNumbers.some(n => n === m.match)) {
                    const lossMatch = loseMatchesA[countB];
                    winMatchA.loss = {
                        round: lossMatch.round,
                        match: lossMatch.match
                    };
                    countA++;
                    countB++;
                    const winMatchB = winMatches.find(x => x.match === fill[countA]);
                    winMatchB.loss = {
                        round: lossMatch.round,
                        match: lossMatch.match
                    };
                }
                else {
                    winMatchA.loss = {
                        round: m.round,
                        match: m.match
                    };
                }
                countA++;
            });
            winRound++;
            matches.filter(m => m.round === roundDiff + 1).forEach((m, i) => {
                const match = matches.find(x => x.round === m.round + 1 && x.match === routeNumbers[i]);
                m.win = {
                    round: match.round,
                    match: match.match
                };
            });
        }
        let ffwd = 0;
        for (let i = winRound; i < roundDiff; i++) {
            let loseMatchesA = matches.filter(m => m.round === loseRound - winRound + ffwd + i);
            const lostMatchesB = matches.filter(m => m.round === loseRound - winRound + ffwd + i + 1);
            if (loseMatchesA.length === lostMatchesB.length) {
                loseMatchesA = lostMatchesB;
                ffwd++;
            }
            const winMatches = matches.filter(m => m.round === i);
            const fill = fillPattern(winMatches.length, fillCount);
            fillCount++;
            loseMatchesA.forEach((m, j) => {
                const match = winMatches.find(m => m.match === fill[j]);
                match.loss = {
                    round: m.round,
                    match: m.match
                };
            });
        }
        for (let i = remainder === 0 ? roundDiff + 1 : roundDiff + 2; i < matches.reduce((max, curr) => Math.max(max, curr.round), 0); i++) {
            const loseMatchesA = matches.filter(m => m.round === i);
            const loseMatchesB = matches.filter(m => m.round === i + 1);
            loseMatchesA.forEach((m, j) => {
                const match = loseMatchesA.length === loseMatchesB.length ? loseMatchesB[j] : loseMatchesB[Math.floor(j / 2)];
                m.win = {
                    round: match.round,
                    match: match.match
                };
            });
        }
        matches.filter(m => m.round === matches.reduce((max, curr) => Math.max(max, curr.round), 0))[0].win = {
            round: roundDiff,
            match: 1
        };
        return matches;
    }

    function RoundRobin(players, startingRound = 1, ordered = false) {
        let matches = [];
        let playerArray = [];
        if (Array.isArray(players)) {
            playerArray = ordered ? players : shuffle(players);
        }
        else {
            playerArray = [...new Array(players)].map((_, i) => i + 1);
        }
        if (playerArray.length % 2 === 1) {
            playerArray.push(null);
        }
        for (let r = startingRound; r < startingRound + playerArray.length - 1; r++) {
            let round = [];
            for (let i = 0; i < playerArray.length / 2; i++) {
                round.push({
                    round: r,
                    match: i + 1,
                    player1: null,
                    player2: null
                });
            }
            if (r === startingRound) {
                round.forEach((m, i) => {
                    m.player1 = playerArray[i];
                    m.player2 = playerArray[playerArray.length - i - 1];
                });
            }
            else {
                const prevRound = matches.filter(m => m.round === r - 1);
                const indexFind = idx => {
                    if (idx + (playerArray.length / 2) > playerArray.length - 2) {
                        return idx + 1 - (playerArray.length / 2);
                    }
                    else {
                        return idx + (playerArray.length / 2);
                    }
                };
                for (let i = 0; i < round.length; i++) {
                    const prev = prevRound[i];
                    const curr = round[i];
                    if (i === 0) {
                        if (prev.player2 === playerArray[playerArray.length - 1]) {
                            curr.player1 = playerArray[playerArray.length - 1];
                            curr.player2 = playerArray[indexFind(playerArray.findIndex(p => p === prev.player1))];
                        }
                        else {
                            curr.player2 = playerArray[playerArray.length - 1];
                            curr.player1 = playerArray[indexFind(playerArray.findIndex(p => p === prev.player2))];
                        }
                    }
                    else {
                        curr.player1 = playerArray[indexFind(playerArray.findIndex(p => p === prev.player1))];
                        curr.player2 = playerArray[indexFind(playerArray.findIndex(p => p === prev.player2))];
                    }
                }
            }
            matches = [...matches, ...round];
        }
        return matches;
    }

    function Stepladder(players, startingRound = 1, ordered = true) {
        const matches = [];
        let playerArray = [];
        if (Array.isArray(players)) {
            playerArray = ordered ? players : shuffle(players);
        }
        else {
            playerArray = [...new Array(players)].map((_, i) => i + 1);
        }
        const rounds = playerArray.length - 1;
        for (let i = startingRound; i < startingRound + rounds; i++) {
            const match = {
                round: i,
                match: 1,
                player1: playerArray[playerArray.length - (i - startingRound) - 2],
                player2: i === startingRound ? playerArray[playerArray.length - (i - startingRound) - 1] : null
            };
            if (i < startingRound + rounds - 1) {
                match.win = {
                    round: i + 1,
                    match: 1
                };
            }
            matches.push(match);
        }
        return matches;
    }

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    /*Converted to JS from Python by Matt Krick. Original: http://jorisvr.nl/maximummatching.html*/

    var blossom = function (edges, maxCardinality) {
      if (edges.length === 0) {
        return edges;
      }
      var edmonds = new Edmonds(edges, maxCardinality);
      return edmonds.maxWeightMatching();

    };

    var Edmonds = function (edges, maxCardinality) {
      this.edges = edges;
      this.maxCardinality = maxCardinality;
      this.nEdge = edges.length;
      this.init();
    };

    Edmonds.prototype.maxWeightMatching = function () {
      for (var t = 0; t < this.nVertex; t++) {
        //console.log('DEBUG: STAGE ' + t);
        this.label = filledArray(2 * this.nVertex, 0);
        this.bestEdge = filledArray(2 * this.nVertex, -1);
        this.blossomBestEdges = initArrArr(2 * this.nVertex);
        this.allowEdge = filledArray(this.nEdge, false);
        this.queue = [];
        for (var v = 0; v < this.nVertex; v++) {
          if (this.mate[v] === -1 && this.label[this.inBlossom[v]] === 0) {
            this.assignLabel(v, 1, -1);
          }
        }
        var augmented = false;
        while (true) {
          //console.log('DEBUG: SUBSTAGE');
          while (this.queue.length > 0 && !augmented) {
            v = this.queue.pop();
            //console.log('DEBUG: POP ', 'v=' + v);
            //console.assert(this.label[this.inBlossom[v]] == 1);
            for (var ii = 0; ii < this.neighbend[v].length; ii++) {
              var p = this.neighbend[v][ii];
              var k = ~~(p / 2);
              var w = this.endpoint[p];
              if (this.inBlossom[v] === this.inBlossom[w]) continue;
              if (!this.allowEdge[k]) {
                var kSlack = this.slack(k);
                if (kSlack <= 0) {
                  this.allowEdge[k] = true;
                }
              }
              if (this.allowEdge[k]) {
                if (this.label[this.inBlossom[w]] === 0) {
                  this.assignLabel(w, 2, p ^ 1);
                } else if (this.label[this.inBlossom[w]] === 1) {
                  var base = this.scanBlossom(v, w);
                  if (base >= 0) {
                    this.addBlossom(base, k);
                  } else {
                    this.augmentMatching(k);
                    augmented = true;
                    break;
                  }
                } else if (this.label[w] === 0) {
                  //console.assert(this.label[this.inBlossom[w]] === 2);
                  this.label[w] = 2;
                  this.labelEnd[w] = p ^ 1;
                }
              } else if (this.label[this.inBlossom[w]] === 1) {
                var b = this.inBlossom[v];
                if (this.bestEdge[b] === -1 || kSlack < this.slack(this.bestEdge[b])) {
                  this.bestEdge[b] = k;
                }
              } else if (this.label[w] === 0) {
                if (this.bestEdge[w] === -1 || kSlack < this.slack(this.bestEdge[w])) {
                  this.bestEdge[w] = k;
                }
              }
            }
          }
          if (augmented) break;
          var deltaType = -1;
          var delta = [];
          var deltaEdge = [];
          var deltaBlossom = [];
          if (!this.maxCardinality) {
            deltaType = 1;
            delta = getMin(this.dualVar, 0, this.nVertex - 1);
          }
          for (v = 0; v < this.nVertex; v++) {
            if (this.label[this.inBlossom[v]] === 0 && this.bestEdge[v] !== -1) {
              var d = this.slack(this.bestEdge[v]);
              if (deltaType === -1 || d < delta) {
                delta = d;
                deltaType = 2;
                deltaEdge = this.bestEdge[v];
              }
            }
          }
          for (b = 0; b < 2 * this.nVertex; b++) {
            if (this.blossomParent[b] === -1 && this.label[b] === 1 && this.bestEdge[b] !== -1) {
              kSlack = this.slack(this.bestEdge[b]);
              ////console.assert((kSlack % 2) == 0);
              d = kSlack / 2;
              if (deltaType === -1 || d < delta) {
                delta = d;
                deltaType = 3;
                deltaEdge = this.bestEdge[b];
              }
            }
          }
          for (b = this.nVertex; b < this.nVertex * 2; b++) {
            if (this.blossomBase[b] >= 0 && this.blossomParent[b] === -1 && this.label[b] === 2 && (deltaType === -1 || this.dualVar[b] < delta)) {
              delta = this.dualVar[b];
              deltaType = 4;
              deltaBlossom = b;
            }
          }
          if (deltaType === -1) {
            //console.assert(this.maxCardinality);
            deltaType = 1;
            delta = Math.max(0, getMin(this.dualVar, 0, this.nVertex - 1));
          }
          for (v = 0; v < this.nVertex; v++) {
            var curLabel = this.label[this.inBlossom[v]];
            if (curLabel === 1) {
              this.dualVar[v] -= delta;
            } else if (curLabel === 2) {
              this.dualVar[v] += delta;
            }
          }
          for (b = this.nVertex; b < this.nVertex * 2; b++) {
            if (this.blossomBase[b] >= 0 && this.blossomParent[b] === -1) {
              if (this.label[b] === 1) {
                this.dualVar[b] += delta;
              } else if (this.label[b] === 2) {
                this.dualVar[b] -= delta;
              }
            }
          }
          //console.log('DEBUG: deltaType', deltaType, ' delta: ', delta);
          if (deltaType === 1) {
            break;
          } else if (deltaType === 2) {
            this.allowEdge[deltaEdge] = true;
            var i = this.edges[deltaEdge][0];
            var j = this.edges[deltaEdge][1];
            this.edges[deltaEdge][2];
            if (this.label[this.inBlossom[i]] === 0) {
              i = i ^ j;
              j = j ^ i;
              i = i ^ j;
            }
            //console.assert(this.label[this.inBlossom[i]] == 1);
            this.queue.push(i);
          } else if (deltaType === 3) {
            this.allowEdge[deltaEdge] = true;
            i = this.edges[deltaEdge][0];
            j = this.edges[deltaEdge][1];
            this.edges[deltaEdge][2];
            //console.assert(this.label[this.inBlossom[i]] == 1);
            this.queue.push(i);
          } else if (deltaType === 4) {
            this.expandBlossom(deltaBlossom, false);
          }
        }
        if (!augmented) break;
        for (b = this.nVertex; b < this.nVertex * 2; b++) {
          if (this.blossomParent[b] === -1 && this.blossomBase[b] >= 0 && this.label[b] === 1 && this.dualVar[b] === 0) {
            this.expandBlossom(b, true);
          }
        }
      }
      for (v = 0; v < this.nVertex; v++) {
        if (this.mate[v] >= 0) {
          this.mate[v] = this.endpoint[this.mate[v]];
        }
      }
      for (v = 0; v < this.nVertex; v++) {
        //console.assert(this.mate[v] == -1 || this.mate[this.mate[v]] == v);
      }
      return this.mate;
    };

    Edmonds.prototype.slack = function (k) {
      var i = this.edges[k][0];
      var j = this.edges[k][1];
      var wt = this.edges[k][2];
      return this.dualVar[i] + this.dualVar[j] - 2 * wt;
    };

    Edmonds.prototype.blossomLeaves = function (b) {
      if (b < this.nVertex) {
        return [b];
      }
      var leaves = [];
      var childList = this.blossomChilds[b];
      for (var t = 0; t < childList.length; t++) {
        if (childList[t] <= this.nVertex) {
          leaves.push(childList[t]);
        } else {
          var leafList = this.blossomLeaves(childList[t]);
          for (var v = 0; v < leafList.length; v++) {
            leaves.push(leafList[v]);
          }
        }
      }
      return leaves;
    };

    Edmonds.prototype.assignLabel = function (w, t, p) {
      //console.log('DEBUG: assignLabel(' + w + ',' + t + ',' + p + '}');
      var b = this.inBlossom[w];
      //console.assert(this.label[w] === 0 && this.label[b] === 0);
      this.label[w] = this.label[b] = t;
      this.labelEnd[w] = this.labelEnd[b] = p;
      this.bestEdge[w] = this.bestEdge[b] = -1;
      if (t === 1) {
        this.queue.push.apply(this.queue, this.blossomLeaves(b));
        //console.log('DEBUG: PUSH ' + this.blossomLeaves(b).toString());
      } else if (t === 2) {
        var base = this.blossomBase[b];
        //console.assert(this.mate[base] >= 0);
        this.assignLabel(this.endpoint[this.mate[base]], 1, this.mate[base] ^ 1);
      }
    };

    Edmonds.prototype.scanBlossom = function (v, w) {
      //console.log('DEBUG: scanBlossom(' + v + ',' + w + ')');
      var path = [];
      var base = -1;
      while (v !== -1 || w !== -1) {
        var b = this.inBlossom[v];
        if ((this.label[b] & 4)) {
          base = this.blossomBase[b];
          break;
        }
        //console.assert(this.label[b] === 1);
        path.push(b);
        this.label[b] = 5;
        //console.assert(this.labelEnd[b] === this.mate[this.blossomBase[b]]);
        if (this.labelEnd[b] === -1) {
          v = -1;
        } else {
          v = this.endpoint[this.labelEnd[b]];
          b = this.inBlossom[v];
          //console.assert(this.label[b] === 2);
          //console.assert(this.labelEnd[b] >= 0);
          v = this.endpoint[this.labelEnd[b]];
        }
        if (w !== -1) {
          v = v ^ w;
          w = w ^ v;
          v = v ^ w;
        }
      }
      for (var ii = 0; ii < path.length; ii++) {
        b = path[ii];
        this.label[b] = 1;
      }
      return base;
    };

    Edmonds.prototype.addBlossom = function (base, k) {
      var v = this.edges[k][0];
      var w = this.edges[k][1];
      this.edges[k][2];
      var bb = this.inBlossom[base];
      var bv = this.inBlossom[v];
      var bw = this.inBlossom[w];
      var b = this.unusedBlossoms.pop();
      //console.log('DEBUG: addBlossom(' + base + ',' + k + ')' + ' (v=' + v + ' w=' + w + ')' + ' -> ' + b);
      this.blossomBase[b] = base;
      this.blossomParent[b] = -1;
      this.blossomParent[bb] = b;
      var path = this.blossomChilds[b] = [];
      var endPs = this.blossomEndPs[b] = [];
      while (bv !== bb) {
        this.blossomParent[bv] = b;
        path.push(bv);
        endPs.push(this.labelEnd[bv]);
        //console.assert(this.label[bv] === 2 || (this.label[bv] === 1 && this.labelEnd[bv] === this.mate[this.blossomBase[bv]]));
        //console.assert(this.labelEnd[bv] >= 0);
        v = this.endpoint[this.labelEnd[bv]];
        bv = this.inBlossom[v];
      }
      path.push(bb);
      path.reverse();
      endPs.reverse();
      endPs.push((2 * k));
      while (bw !== bb) {
        this.blossomParent[bw] = b;
        path.push(bw);
        endPs.push(this.labelEnd[bw] ^ 1);
        //console.assert(this.label[bw] === 2 || (this.label[bw] === 1 && this.labelEnd[bw] === this.mate[this.blossomBase[bw]]));
        //console.assert(this.labelEnd[bw] >= 0);
        w = this.endpoint[this.labelEnd[bw]];
        bw = this.inBlossom[w];
      }
      //console.assert(this.label[bb] === 1);
      this.label[b] = 1;
      this.labelEnd[b] = this.labelEnd[bb];
      this.dualVar[b] = 0;
      var leaves = this.blossomLeaves(b);
      for (var ii = 0; ii < leaves.length; ii++) {
        v = leaves[ii];
        if (this.label[this.inBlossom[v]] === 2) {
          this.queue.push(v);
        }
        this.inBlossom[v] = b;
      }
      var bestEdgeTo = filledArray(2 * this.nVertex, -1);
      for (ii = 0; ii < path.length; ii++) {
        bv = path[ii];
        if (this.blossomBestEdges[bv].length === 0) {
          var nbLists = [];
          leaves = this.blossomLeaves(bv);
          for (var x = 0; x < leaves.length; x++) {
            v = leaves[x];
            nbLists[x] = [];
            for (var y = 0; y < this.neighbend[v].length; y++) {
              var p = this.neighbend[v][y];
              nbLists[x].push(~~(p / 2));
            }
          }
        } else {
          nbLists = [this.blossomBestEdges[bv]];
        }
        //console.log('DEBUG: nbLists ' + nbLists.toString());
        for (x = 0; x < nbLists.length; x++) {
          var nbList = nbLists[x];
          for (y = 0; y < nbList.length; y++) {
            k = nbList[y];
            var i = this.edges[k][0];
            var j = this.edges[k][1];
            this.edges[k][2];
            if (this.inBlossom[j] === b) {
              i = i ^ j;
              j = j ^ i;
              i = i ^ j;
            }
            var bj = this.inBlossom[j];
            if (bj !== b && this.label[bj] === 1 && (bestEdgeTo[bj] === -1 || this.slack(k) < this.slack(bestEdgeTo[bj]))) {
              bestEdgeTo[bj] = k;
            }
          }
        }
        this.blossomBestEdges[bv] = [];
        this.bestEdge[bv] = -1;
      }
      var be = [];
      for (ii = 0; ii < bestEdgeTo.length; ii++) {
        k = bestEdgeTo[ii];
        if (k !== -1) {
          be.push(k);
        }
      }
      this.blossomBestEdges[b] = be;
      //console.log('DEBUG: blossomBestEdges[' + b + ']= ' + this.blossomBestEdges[b].toString());
      this.bestEdge[b] = -1;
      for (ii = 0; ii < this.blossomBestEdges[b].length; ii++) {
        k = this.blossomBestEdges[b][ii];
        if (this.bestEdge[b] === -1 || this.slack(k) < this.slack(this.bestEdge[b])) {
          this.bestEdge[b] = k;
        }
      }
      //console.log('DEBUG: blossomChilds[' + b + ']= ' + this.blossomChilds[b].toString());
    };

    Edmonds.prototype.expandBlossom = function (b, endStage) {
      //console.log('DEBUG: expandBlossom(' + b + ',' + endStage + ') ' + this.blossomChilds[b].toString());
      for (var ii = 0; ii < this.blossomChilds[b].length; ii++) {
        var s = this.blossomChilds[b][ii];
        this.blossomParent[s] = -1;
        if (s < this.nVertex) {
          this.inBlossom[s] = s;
        } else if (endStage && this.dualVar[s] === 0) {
          this.expandBlossom(s, endStage);
        } else {
          var leaves = this.blossomLeaves(s);
          for (var jj = 0; jj < leaves.length; jj++) {
            var v = leaves[jj];
            this.inBlossom[v] = s;
          }
        }
      }
      if (!endStage && this.label[b] === 2) {
        //console.assert(this.labelEnd[b] >= 0);
        var entryChild = this.inBlossom[this.endpoint[this.labelEnd[b] ^ 1]];
        var j = this.blossomChilds[b].indexOf(entryChild);
        if ((j & 1)) {
          j -= this.blossomChilds[b].length;
          var jStep = 1;
          var endpTrick = 0;
        } else {
          jStep = -1;
          endpTrick = 1;
        }
        var p = this.labelEnd[b];
        while (j !== 0) {
          this.label[this.endpoint[p ^ 1]] = 0;
          this.label[this.endpoint[pIndex(this.blossomEndPs[b], j - endpTrick) ^ endpTrick ^ 1]] = 0;
          this.assignLabel(this.endpoint[p ^ 1], 2, p);
          this.allowEdge[~~(pIndex(this.blossomEndPs[b], j - endpTrick) / 2)] = true;
          j += jStep;
          p = pIndex(this.blossomEndPs[b], j - endpTrick) ^ endpTrick;
          this.allowEdge[~~(p / 2)] = true;
          j += jStep;
        }
        var bv = pIndex(this.blossomChilds[b], j);
        this.label[this.endpoint[p ^ 1]] = this.label[bv] = 2;

        this.labelEnd[this.endpoint[p ^ 1]] = this.labelEnd[bv] = p;
        this.bestEdge[bv] = -1;
        j += jStep;
        while (pIndex(this.blossomChilds[b], j) !== entryChild) {
          bv = pIndex(this.blossomChilds[b], j);
          if (this.label[bv] === 1) {
            j += jStep;
            continue;
          }
          leaves = this.blossomLeaves(bv);
          for (ii = 0; ii < leaves.length; ii++) {
            v = leaves[ii];
            if (this.label[v] !== 0) break;
          }
          if (this.label[v] !== 0) {
            //console.assert(this.label[v] === 2);
            //console.assert(this.inBlossom[v] === bv);
            this.label[v] = 0;
            this.label[this.endpoint[this.mate[this.blossomBase[bv]]]] = 0;
            this.assignLabel(v, 2, this.labelEnd[v]);
          }
          j += jStep;
        }
      }
      this.label[b] = this.labelEnd[b] = -1;
      this.blossomEndPs[b] = this.blossomChilds[b] = [];
      this.blossomBase[b] = -1;
      this.blossomBestEdges[b] = [];
      this.bestEdge[b] = -1;
      this.unusedBlossoms.push(b);
    };

    Edmonds.prototype.augmentBlossom = function (b, v) {
      //console.log('DEBUG: augmentBlossom(' + b + ',' + v + ')');
      var i, j;
      var t = v;
      while (this.blossomParent[t] !== b) {
        t = this.blossomParent[t];
      }
      if (t > this.nVertex) {
        this.augmentBlossom(t, v);
      }
      i = j = this.blossomChilds[b].indexOf(t);
      if ((i & 1)) {
        j -= this.blossomChilds[b].length;
        var jStep = 1;
        var endpTrick = 0;
      } else {
        jStep = -1;
        endpTrick = 1;
      }
      while (j !== 0) {
        j += jStep;
        t = pIndex(this.blossomChilds[b], j);
        var p = pIndex(this.blossomEndPs[b], j - endpTrick) ^ endpTrick;
        if (t >= this.nVertex) {
          this.augmentBlossom(t, this.endpoint[p]);
        }
        j += jStep;
        t = pIndex(this.blossomChilds[b], j);
        if (t >= this.nVertex) {
          this.augmentBlossom(t, this.endpoint[p ^ 1]);
        }
        this.mate[this.endpoint[p]] = p ^ 1;
        this.mate[this.endpoint[p ^ 1]] = p;
      }
      //console.log('DEBUG: PAIR ' + this.endpoint[p] + ' ' + this.endpoint[p^1] + '(k=' + ~~(p/2) + ')');
      this.blossomChilds[b] = this.blossomChilds[b].slice(i).concat(this.blossomChilds[b].slice(0, i));
      this.blossomEndPs[b] = this.blossomEndPs[b].slice(i).concat(this.blossomEndPs[b].slice(0, i));
      this.blossomBase[b] = this.blossomBase[this.blossomChilds[b][0]];
      //console.assert(this.blossomBase[b] === v);
    };

    Edmonds.prototype.augmentMatching = function (k) {
      var v = this.edges[k][0];
      var w = this.edges[k][1];
      //console.log('DEBUG: augmentMatching(' + k + ')' + ' (v=' + v + ' ' + 'w=' + w);
      //console.log('DEBUG: PAIR ' + v + ' ' + w + '(k=' + k + ')');
      for (var ii = 0; ii < 2; ii++) {
        if (ii === 0) {
          var s = v;
          var p = 2 * k + 1;
        } else {
          s = w;
          p = 2 * k;
        }
        while (true) {
          var bs = this.inBlossom[s];
          //console.assert(this.label[bs] === 1);
          //console.assert(this.labelEnd[bs] === this.mate[this.blossomBase[bs]]);
          if (bs >= this.nVertex) {
            this.augmentBlossom(bs, s);
          }
          this.mate[s] = p;
          if (this.labelEnd[bs] === -1) break;
          var t = this.endpoint[this.labelEnd[bs]];
          var bt = this.inBlossom[t];
          //console.assert(this.label[bt] === 2);
          //console.assert(this.labelEnd[bt] >= 0);
          s = this.endpoint[this.labelEnd[bt]];
          var j = this.endpoint[this.labelEnd[bt] ^ 1];
          //console.assert(this.blossomBase[bt] === t);
          if (bt >= this.nVertex) {
            this.augmentBlossom(bt, j);
          }
          this.mate[j] = this.labelEnd[bt];
          p = this.labelEnd[bt] ^ 1;
          //console.log('DEBUG: PAIR ' + s + ' ' + t + '(k=' + ~~(p/2) + ')');


        }
      }
    };


    //INIT STUFF//
    Edmonds.prototype.init = function () {
      this.nVertexInit();
      this.maxWeightInit();
      this.endpointInit();
      this.neighbendInit();
      this.mate = filledArray(this.nVertex, -1);
      this.label = filledArray(2 * this.nVertex, 0); //remove?
      this.labelEnd = filledArray(2 * this.nVertex, -1);
      this.inBlossomInit();
      this.blossomParent = filledArray(2 * this.nVertex, -1);
      this.blossomChilds = initArrArr(2 * this.nVertex);
      this.blossomBaseInit();
      this.blossomEndPs = initArrArr(2 * this.nVertex);
      this.bestEdge = filledArray(2 * this.nVertex, -1); //remove?
      this.blossomBestEdges = initArrArr(2 * this.nVertex); //remove?
      this.unusedBlossomsInit();
      this.dualVarInit();
      this.allowEdge = filledArray(this.nEdge, false); //remove?
      this.queue = []; //remove?
    };
    Edmonds.prototype.blossomBaseInit = function () {
      var base = [];
      for (var i = 0; i < this.nVertex; i++) {
        base[i] = i;
      }
      var negs = filledArray(this.nVertex, -1);
      this.blossomBase = base.concat(negs);
    };
    Edmonds.prototype.dualVarInit = function () {
      var mw = filledArray(this.nVertex, this.maxWeight);
      var zeros = filledArray(this.nVertex, 0);
      this.dualVar = mw.concat(zeros);
    };
    Edmonds.prototype.unusedBlossomsInit = function () {
      var i, unusedBlossoms = [];
      for (i = this.nVertex; i < 2 * this.nVertex; i++) {
        unusedBlossoms.push(i);
      }
      this.unusedBlossoms = unusedBlossoms;
    };
    Edmonds.prototype.inBlossomInit = function () {
      var i, inBlossom = [];
      for (i = 0; i < this.nVertex; i++) {
        inBlossom[i] = i;
      }
      this.inBlossom = inBlossom;
    };
    Edmonds.prototype.neighbendInit = function () {
      var k, i, j;
      var neighbend = initArrArr(this.nVertex);
      for (k = 0; k < this.nEdge; k++) {
        i = this.edges[k][0];
        j = this.edges[k][1];
        neighbend[i].push(2 * k + 1);
        neighbend[j].push(2 * k);
      }
      this.neighbend = neighbend;
    };
    Edmonds.prototype.endpointInit = function () {
      var p;
      var endpoint = [];
      for (p = 0; p < 2 * this.nEdge; p++) {
        endpoint[p] = this.edges[~~(p / 2)][p % 2];
      }
      this.endpoint = endpoint;
    };
    Edmonds.prototype.nVertexInit = function () {
      var nVertex = 0;
      for (var k = 0; k < this.nEdge; k++) {
        var i = this.edges[k][0];
        var j = this.edges[k][1];
        if (i >= nVertex) nVertex = i + 1;
        if (j >= nVertex) nVertex = j + 1;
      }
      this.nVertex = nVertex;
    };
    Edmonds.prototype.maxWeightInit = function () {
      var maxWeight = 0;
      for (var k = 0; k < this.nEdge; k++) {
        var weight = this.edges[k][2];
        if (weight > maxWeight) {
          maxWeight = weight;
        }
      }
      this.maxWeight = maxWeight;
    };

    //HELPERS//
    function filledArray(len, fill) {
      var i, newArray = [];
      for (i = 0; i < len; i++) {
        newArray[i] = fill;
      }
      return newArray;
    }

    function initArrArr(len) {
      var arr = [];
      for (var i = 0; i < len; i++) {
        arr[i] = [];
      }
      return arr;
    }

    function getMin(arr, start, end) {
      var min = Infinity;
      for (var i = start; i <= end; i++) {
        if (arr[i] < min) {
          min = arr[i];
        }
      }
      return min;
    }

    function pIndex(arr, idx) {
      //if idx is negative, go from the back
      return idx < 0 ? arr[arr.length + idx] : arr[idx];
    }

    var blossom$1 = /*@__PURE__*/getDefaultExportFromCjs(blossom);

    function Swiss(players, round, rated = false, colors = false) {
        const matches = [];
        let playerArray = [];
        if (Array.isArray(players)) {
            playerArray = players;
        }
        else {
            playerArray = [...new Array(players)].map((_, i) => i + 1);
        }
        if (rated) {
            playerArray.filter(p => !p.hasOwnProperty('rating') || p.rating === null).forEach(p => p.rating = 0);
        }
        if (colors) {
            playerArray.filter(p => !p.hasOwnProperty('colors')).forEach(p => p.colors = []);
        }
        playerArray.forEach((p, i) => p.index = i);
        const scoreGroups = [...new Set(playerArray.map(p => p.score))].sort((a, b) => a - b);
        const scoreSums = [...new Set(scoreGroups.map((s, i, a) => {
                let sums = [];
                for (let j = i; j < a.length; j++) {
                    sums.push(s + a[j]);
                }
                return sums;
            }).flat())].sort((a, b) => a - b);
        const scoreGroupPlayers = scoreGroups.reduce((sgps, sg) => {
            sgps[sg] = playerArray.filter((p) => p.score === sg);
            return sgps;
        }, {});
        console.log("score sums", scoreSums);
        console.log("score groups", scoreGroups);
        console.log("scoreGroupPlayers", scoreGroupPlayers);
        let pairs = [];
        let debugPairs = [];
        for (let i = 0; i < playerArray.length; i++) {
            const curr = playerArray[i];
            const next = playerArray.slice(i + 1);
            const sorted = rated
                ? [...next].sort((a, b) => Math.abs(curr.rating - a.rating) -
                    Math.abs(curr.rating - b.rating))
                : [];
            // sort rank from high to low
            const reversedScoreGroups = [...scoreGroups].reverse();
            let evenHighThreshold = 999;
            let evenLowThreshold = 0;
            let evenSlicePlayerCount = 0;
            for (let k = 0; k < reversedScoreGroups.length; k++) {
                const sg = reversedScoreGroups[k];
                const count = scoreGroupPlayers[sg].length;
                evenSlicePlayerCount += count;
                if (evenSlicePlayerCount % 2 === 0) {
                    if (evenSlicePlayerCount === 2) {
                        const p1 = scoreGroupPlayers[sg][0];
                        const p2 = scoreGroupPlayers[sg][1];
                        if (p1.avoid.includes(p2.id)) {
                            continue;
                        }
                    }
                    if (sg > curr.score) {
                        evenHighThreshold = sg;
                        evenSlicePlayerCount = 0;
                        continue;
                    }
                    evenLowThreshold = sg;
                    break;
                }
            }
            console.debug("score, evenHighThreshold, evenLowThreshold, evenSlicePlayerCount", curr.score, evenHighThreshold, evenLowThreshold, evenSlicePlayerCount);
            const evenSlicePlayers = playerArray.filter((p) => p.score < evenHighThreshold && p.score >= evenLowThreshold);
            console.log("evenSlicePlayers", evenSlicePlayers);
            const halfway = evenSlicePlayers.length / 2;
            for (let j = 0; j < next.length; j++) {
                const opp = next[j];
                if (curr.hasOwnProperty("avoid") && curr.avoid.includes(opp.id)) {
                    continue;
                }
                let debugWt = [];
                // prioritize pair with higher total score
                const scoreSumIndex = scoreSums.findIndex((s) => s === curr.score + opp.score);
                let wt = 14 * Math.log10(scoreSumIndex + 1);
                debugWt.push(['score', wt]);
                const isSameSlice = evenSlicePlayers.find((p) => p.id === opp.id);
                const currIndex = evenSlicePlayers.findIndex((p) => p.id === curr.id);
                const oppIndex = evenSlicePlayers.findIndex((p) => p.id === opp.id);
                if (isSameSlice) {
                    if (currIndex < halfway && oppIndex >= halfway) {
                        const indexDiff = oppIndex - currIndex - halfway;
                        if (indexDiff >= -1) {
                            wt += 5 / Math.log10(currIndex + oppIndex + 3);
                        }
                        else {
                            wt += 1 / Math.log10(2);
                        }
                        debugWt.push([
                            "halfway",
                            wt,
                            oppIndex,
                            currIndex,
                            halfway,
                            indexDiff,
                        ]);
                    }
                    else {
                        debugWt.push(["same half", wt, oppIndex, currIndex, halfway]);
                    }
                }
                else {
                    debugWt.push([
                        "not same slice",
                        wt,
                        oppIndex,
                        currIndex,
                        halfway,
                    ]);
                }
                if (rated) {
                    wt +=
                        (Math.log2(sorted.length) -
                            Math.log2(sorted.findIndex((p) => p.id === opp.id) + 1)) /
                            3;
                    debugWt.push(["rated", wt]);
                }
                if (colors) {
                    debugWt.push(["colors", wt]);
                    const colorScore = curr.colors.reduce((sum, color) => (color === "w" ? sum + 1 : sum - 1), 0);
                    const oppScore = opp.colors.reduce((sum, color) => (color === "w" ? sum + 1 : sum - 1), 0);
                    if (curr.colors.length > 1 &&
                        curr.colors.slice(-2).join("") === "ww") {
                        if (opp.colors.slice(-2).join("") === "ww") {
                            continue;
                        }
                        else if (opp.colors.slice(-2).join("") === "bb") {
                            wt += 7;
                        }
                        else {
                            wt += 2 / Math.log(4 - Math.abs(oppScore));
                        }
                    }
                    else if (curr.colors.length > 1 &&
                        curr.colors.slice(-2).join("") === "bb") {
                        if (opp.colors.slice(-2).join("") === "bb") {
                            continue;
                        }
                        else if (opp.colors.slice(-2).join("") === "ww") {
                            wt += 8;
                        }
                        else {
                            wt += 2 / Math.log(4 - Math.abs(oppScore));
                        }
                    }
                    else {
                        wt += 5 / (4 * Math.log10(10 - Math.abs(colorScore - oppScore)));
                    }
                }
                if ((curr.hasOwnProperty("receivedBye") && curr.receivedBye) ||
                    (opp.hasOwnProperty("receivedBye") && opp.receivedBye)) {
                    const scoreGroupDiff = Math.abs(scoreGroups.findIndex((s) => s === curr.score) - scoreGroups.findIndex((s) => s === opp.score));
                    if (scoreGroupDiff === 0) {
                        wt *= 1.5;
                        debugWt.push(["bye", wt]);
                    }
                    else if (scoreGroupDiff === 1) {
                        wt *= 1.25;
                    }
                }
                pairs.push([curr.index, opp.index, wt]);
                debugPairs.push([curr.index, opp.index, wt, debugWt]);
            }
        }
        if (pairs.length === 0) {
            return [];
        }
        const blossomPairs = blossom$1(pairs, true);
        console.log("pairings input players", playerArray);
        console.log("debug pairings pairs", debugPairs);
        console.log("pairings pairs", pairs);
        console.log("blossomPairs", blossomPairs);
        let playerCopy = [...playerArray];
        let byeArray = [];
        let match = 1;
        do {
            const indexA = playerCopy[0].index;
            const indexB = blossomPairs[indexA];
            if (indexB === -1) {
                byeArray.push(playerCopy.splice(0, 1)[0]);
                continue;
            }
            playerCopy.splice(0, 1);
            playerCopy.splice(playerCopy.findIndex(p => p.index === indexB), 1);
            let playerA = playerArray.find(p => p.index === indexA);
            let playerB = playerArray.find(p => p.index === indexB);
            if (colors) {
                const aScore = playerA.colors.reduce((sum, color) => color === 'w' ? sum + 1 : sum - 1, 0);
                const bScore = playerB.colors.reduce((sum, color) => color === 'w' ? sum + 1 : sum - 1, 0);
                if (playerB.colors.slice(-2).join('') === 'bb' ||
                    playerA.colors.slice(-2).join('') === 'ww' ||
                    (playerB.colors.slice(-1) === 'b' && playerA.colors.slice(-1) === 'w') ||
                    bScore < aScore) {
                    [playerA, playerB] = [playerB, playerA];
                }
            }
            matches.push({
                round: round,
                match: match++,
                player1: playerA.id,
                player2: playerB.id
            });
        } while (playerCopy.length > blossomPairs.reduce((sum, idx) => idx === -1 ? sum + 1 : sum, 0));
        byeArray = [...byeArray, ...playerCopy];
        for (let i = 0; i < byeArray.length; i++) {
            matches.push({
                round: round,
                match: match++,
                player1: byeArray[i].id,
                player2: null
            });
        }
        return matches;
    }

    exports.DoubleElimination = DoubleElimination;
    exports.RoundRobin = RoundRobin;
    exports.SingleElimination = SingleElimination;
    exports.Stepladder = Stepladder;
    exports.Swiss = Swiss;

}));
