const ApiError = require('./ApiError');

const MAX = { name: 120, module: 160, location: 200, remarks: 1000, time: 40 };

const trim = (v) => (typeof v === 'string' ? v.trim() : v);

function ensureMax(v, max, label) {
  if (typeof v === 'string' && v.length > max) {
    throw new ApiError(400, `${label} must be at most ${max} characters.`);
  }
  return v;
}

function reqStr(v, label, max) {
  const s = trim(v);
  if (!s || typeof s !== 'string') throw new ApiError(400, `${label} is required.`);
  return ensureMax(s, max, label);
}

function score(v, label) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 1 || n > 10) throw new ApiError(400, `${label} must be between 1 and 10.`);
  return Math.round(n);
}

/** Validate + sanitize the start-training / schedule payload. */
function validateTrainingInput(body, { partial = false } = {}) {
  const b = body || {};
  const out = {};
  const set = (key, label, max, required) => {
    if (b[key] === undefined) {
      if (required && !partial) throw new ApiError(400, `${label} is required.`);
      return;
    }
    out[key] = required ? reqStr(b[key], label, max) : ensureMax(trim(b[key]) || '', max, label);
  };
  set('mentorName', 'Mentor name', MAX.name, true);
  set('companySupervisor', 'Company supervisor', MAX.name, false);
  set('trainingModule', 'Training module', MAX.module, true);
  set('reportingLocation', 'Reporting location', MAX.location, true);
  set('joiningDate', 'Joining date', MAX.time, true);
  set('reportingTime', 'Reporting time', MAX.time, true);
  if (b.duration !== undefined) {
    const d = Number(b.duration);
    if (!Number.isFinite(d) || d < 1 || d > 104) throw new ApiError(400, 'Duration must be between 1 and 104.');
    out.duration = Math.round(d);
  } else if (!partial) {
    throw new ApiError(400, 'Duration is required.');
  }
  return out;
}

/** Validate + sanitize an evaluation submission. */
function validateEvaluation(body) {
  const b = body || {};
  return {
    communication: score(b.communication, 'Communication'),
    technicalSkills: score(b.technicalSkills, 'Technical skills'),
    punctuality: score(b.punctuality, 'Punctuality'),
    overallPerformance: score(b.overallPerformance, 'Overall performance'),
    remarks: ensureMax(trim(b.remarks) || '', MAX.remarks, 'Remarks'),
  };
}

module.exports = { MAX, trim, ensureMax, validateTrainingInput, validateEvaluation };
