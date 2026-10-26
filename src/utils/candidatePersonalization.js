/**
 * Candidate Personalization & Job Matching Engine
 * 
 * Centralized rule engine to ensure that when a candidate selects any specific
 * track and level combination (IT Fresher, IT Experienced, Non-IT Fresher,
 * Non-IT Experienced, Gig, etc.), only jobs relevant to that combo are visible
 * across ALL pages (Home, Jobs, Categories, Company Profiles).
 */

export function getCandidateProfile(user) {
  if (!user || (user.role !== 'candidate' && user.role !== 'user')) {
    return { isCandidate: false, isItFresher: false };
  }

  const track = (user.careerTrack || '').toLowerCase().trim();
  const subTrack = (user.subTrack || '').toLowerCase().trim();

  let preferences = {};
  if (user.preferences) {
    if (typeof user.preferences === 'object') {
      preferences = user.preferences;
    } else if (typeof user.preferences === 'string') {
      try {
        preferences = JSON.parse(user.preferences);
      } catch {}
    }
  }

  const prefLevel = (preferences.level || '').toLowerCase().trim();
  const isFresher = prefLevel === 'fresher' ? true : prefLevel === 'experienced' ? false : subTrack.includes('fresher');
  const isNonIt = track === 'non-it' || track === 'nonit' || (!track && (subTrack.includes('non-it') || subTrack.includes('non it')));
  const isGig = track === 'gig' || (!track && subTrack.includes('gig'));
  const isIt = (track === 'it' || (!track && !isNonIt && !isGig && (/\bit\b/i.test(subTrack) || subTrack.includes('tech') || subTrack.includes('software')))) && !isNonIt && !isGig;

  return {
    isCandidate: true,
    track,
    subTrack,
    level: isFresher ? 'fresher' : (prefLevel || 'experienced'),
    isIt,
    isNonIt,
    isGig,
    isFresher,
    isItFresher: isIt && isFresher,
    isItExperienced: isIt && !isFresher,
    isNonItFresher: isNonIt && isFresher,
    isNonItExperienced: isNonIt && !isFresher,
    preferences
  };
}

export function isGigJob(job) {
  if (!job) return false;
  const cat = (job.category || job.jobCategory || '').toLowerCase();
  const type = (job.jobCategoryType || '').toLowerCase();
  return cat.includes('gig') || type.includes('gig') || cat.includes('service') || cat.includes('freelance');
}

export function isItJob(job) {
  if (!job) return false;
  const cat = (job.category || job.jobCategory || '').toLowerCase();
  const type = (job.jobCategoryType || '').toLowerCase();
  const title = (job.title || '').toLowerCase();

  // Non-IT and Gig jobs are not IT
  if (cat.includes('non-it') || type.includes('non') || cat.includes('gig') || type.includes('gig')) {
    return false;
  }

  return (
    type === 'it' ||
    type.includes('it job') ||
    cat.includes('it') ||
    cat.includes('software') ||
    cat.includes('tech') ||
    title.includes('software') ||
    title.includes('developer') ||
    title.includes('engineer') ||
    title.includes('programmer') ||
    title.includes('frontend') ||
    title.includes('backend') ||
    title.includes('full stack') ||
    title.includes('react') ||
    title.includes('qa') ||
    title.includes('cloud') ||
    title.includes('devops') ||
    title.includes('data')
  );
}

export function isNonItJob(job) {
  if (!job) return false;
  const cat = (job.category || job.jobCategory || '').toLowerCase();
  const type = (job.jobCategoryType || '').toLowerCase();
  if (isItJob(job) || isGigJob(job)) return false;
  return (
    type.includes('non') ||
    cat.includes('non-it') ||
    cat.includes('operations') ||
    cat.includes('bpo') ||
    cat.includes('sales') ||
    cat.includes('hr') ||
    cat.includes('private') ||
    cat.includes('banking')
  );
}

export function isFresherJob(job) {
  if (!job) return false;
  const exp = (job.experience || '').toLowerCase();
  const title = (job.title || '').toLowerCase();
  const sub = (job.subtitle || '').toLowerCase();
  const cat = (job.category || job.jobCategory || '').toLowerCase();

  return (
    job.isFresh === true ||
    job.isfresh === true ||
    exp.includes('0') ||
    exp.includes('fresher') ||
    exp.includes('graduate') ||
    exp.includes('entry') ||
    exp.includes('intern') ||
    title.includes('fresher') ||
    title.includes('graduate') ||
    title.includes('entry') ||
    title.includes('trainee') ||
    title.includes('intern') ||
    title.includes('associate') ||
    sub.includes('fresher') ||
    sub.includes('entry') ||
    cat.includes('fresher')
  );
}

export function isItFresherJob(job) {
  return isItJob(job) && isFresherJob(job);
}

export function isJobMatchingCandidate(job, candidateProfile) {
  if (!candidateProfile || !candidateProfile.isCandidate) return true;

  // 1. IT Track
  if (candidateProfile.track === 'it' || candidateProfile.isIt) {
    if (candidateProfile.isFresher) {
      return isItFresherJob(job);
    }
    // IT Experienced
    return isItJob(job) && !isFresherJob(job);
  }

  // 2. Non-IT Track
  if (candidateProfile.track === 'non-it' || candidateProfile.track === 'nonit' || candidateProfile.isNonIt) {
    if (candidateProfile.isFresher) {
      return isNonItJob(job) && isFresherJob(job);
    }
    // Non-IT Experienced
    return isNonItJob(job) && !isFresherJob(job);
  }

  // 3. Gig Track
  if (candidateProfile.track === 'gig' || candidateProfile.isGig) {
    return isGigJob(job);
  }

  // 4. Other tracks
  return true;
}

export function getComboBadgeInfo(candidateProfile) {
  if (!candidateProfile || !candidateProfile.isCandidate) {
    return {
      label: 'Member',
      fullTitle: 'Platform Member',
      color: 'slate',
      pillClass: 'bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-neutral-700'
    };
  }

  const { track, isFresher, isIt, isNonIt, isGig } = candidateProfile;

  if (track === 'it' || isIt) {
    if (isFresher) {
      return {
        label: 'IT Fresher',
        fullTitle: 'IT & Software · Fresher (0-1y)',
        color: 'brand',
        pillClass: 'bg-brand/10 text-brand dark:text-brand-hover border border-brand/20'
      };
    }
    return {
      label: 'IT Pro',
      fullTitle: 'IT & Software · Experienced (1y+)',
      color: 'blue',
      pillClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
    };
  }

  if (track === 'non-it' || track === 'nonit' || isNonIt) {
    if (isFresher) {
      return {
        label: 'Non-IT Fresher',
        fullTitle: 'Non-IT & Ops · Fresher (0-1y)',
        color: 'purple',
        pillClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
      };
    }
    return {
      label: 'Non-IT Specialist',
      fullTitle: 'Non-IT & Ops · Experienced',
      color: 'indigo',
      pillClass: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
    };
  }

  if (track === 'gig' || isGig) {
    return {
      label: 'Gig Worker',
      fullTitle: 'Gig & Freelance Specialist',
      color: 'amber',
      pillClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
    };
  }

  return {
    label: 'Candidate',
    fullTitle: 'Verified Candidate',
    color: 'brand',
    pillClass: 'bg-brand/10 text-brand border border-brand/20'
  };
}
