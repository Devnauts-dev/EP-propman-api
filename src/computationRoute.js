// computationRoute.js

const express = require('express');
const router = express.Router();

// ─── COMPUTATION FUNCTIONS ────────────────────────────────

function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}

function findPrimes(limit) {
  const primes = [];
  for (let i = 2; i <= limit; i++) {
    if (isPrime(i)) primes.push(i);
  }
  return primes;
}

function computeStats(numbers) {
  const sum     = numbers.reduce((a, b) => a + b, 0);
  const avg     = sum / numbers.length;
  const sorted  = [...numbers].sort((a, b) => a - b);
  const median  = sorted[Math.floor(sorted.length / 2)];
  const max     = Math.max(...numbers);
  const min     = Math.min(...numbers);
  const stddev  = Math.sqrt(
    numbers.map(n => Math.pow(n - avg, 2)).reduce((a, b) => a + b, 0) / numbers.length
  );
  return { sum, avg, median, max, min, stddev: stddev.toFixed(2) };
}

function fibonacci(n) {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}

// ─── ENDPOINT ─────────────────────────────────────────────

// GET /api/compute?limit=100&fibn=10&numbers=1,2,3,4,5
router.get('/compute', (req, res) => {
  const startTime = Date.now();

  // Parse params with safe defaults
  const limit   = Math.min(parseInt(req.query.limit)   || 100, 5000); // max 5000
  const fibn    = Math.min(parseInt(req.query.fibn)    || 10,  1000); // max 1000
  const numbers = (req.query.numbers || '1,2,3,4,5,6,7,8,9,10')
    .split(',')
    .map(Number)
    .filter(n => !isNaN(n));

  // Run computations
  const primes    = findPrimes(limit);
  const fibResult = fibonacci(fibn);
  const stats     = computeStats(numbers);

  const duration  = Date.now() - startTime;

  res.json({
    success: true,
    input: { limit, fibn, numbers },
    results: {
      primes: {
        count: primes.length,
        largest: primes[primes.length - 1],
        list: primes.slice(0, 10),   // first 10 only
      },
      fibonacci: {
        n: fibn,
        result: fibResult,
      },
      stats,
    },
    meta: {
      computationTimeMs: duration,
      timestamp: new Date().toISOString(),
    },
  });
});

module.exports = router;