
import type { UserProfile, LifeStats } from './types';

export const calculateLifeStats = (profile: UserProfile): LifeStats => {
  const birthDate = new Date(profile.birthday);
  const now = new Date();
  
  // 验证日期有效性
  if (isNaN(birthDate.getTime())) {
    throw new Error('Invalid birth date');
  }
  
  const endDate = new Date(birthDate);
  endDate.setFullYear(birthDate.getFullYear() + profile.expectedAge);

  const diffMs = now.getTime() - birthDate.getTime();
  const totalMs = endDate.getTime() - birthDate.getTime();
  const remainingMs = endDate.getTime() - now.getTime();
  
  // 防止除零错误
  if (totalMs <= 0) {
    return {
      weeksPassed: 0,
      weeksRemaining: 0,
      percentagePassed: 100,
      daysRemaining: 0,
      hoursRemaining: 0,
      secondsRemaining: 0,
      sleepRemainingYears: 0,
      workRemainingYears: 0
    };
  }

  const msPerWeek = 1000 * 60 * 60 * 24 * 7;
  
  const weeksPassed = Math.floor(diffMs / msPerWeek);
  const totalWeeks = Math.floor(totalMs / msPerWeek);
  const weeksRemaining = totalWeeks - weeksPassed;
  
  const percentagePassed = (diffMs / totalMs) * 100;
  
  const daysRemaining = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor(remainingMs / (1000 * 60 * 60));
  const secondsRemaining = Math.floor(remainingMs / 1000);

  // Assumptions: 8 hours sleep, 8 hours work/maintenance per day
  const sleepRemainingYears = (remainingMs / totalMs) * profile.expectedAge * (1/3);
  const workRemainingYears = (remainingMs / totalMs) * profile.expectedAge * (1/3);

  return {
    weeksPassed,
    weeksRemaining: Math.max(0, weeksRemaining),
    percentagePassed: Math.min(100, Math.max(0, percentagePassed)),
    daysRemaining: Math.max(0, daysRemaining),
    hoursRemaining: Math.max(0, hoursRemaining),
    secondsRemaining: Math.max(0, secondsRemaining),
    sleepRemainingYears,
    workRemainingYears
  };
};

export const getAgePhaseKey = (age: number): 'discovery' | 'potential' | 'creation' | 'legacy' | 'reflection' => {
  if (age <= 18) return 'discovery';
  if (age <= 30) return 'potential';
  if (age <= 45) return 'creation';
  if (age <= 65) return 'legacy';
  return 'reflection';
};

