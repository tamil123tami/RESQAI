import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { monitoredAreas, hospitals as initialHospitals, resqTeams, alerts as initialAlerts, initialAiDecisions } from '../data/mockData';
import { getUserCurrentLocation, calculateDistanceKm, calculateTransitEta, reverseGeocodeCoordinates } from '../services/locationService';
import { sendCommanderAlert, sendCitizenAlert, sendDeployAlert } from '../services/notificationService';
import { analyzeDisasterWithAI, reanalyzeDecision, generateFieldTasksWithAI } from '../services/llmIntegration';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // ── User Live Location & Manual Search ─────────────────────────────────────
  const [userLocation, setUserLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('resqai_user_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isRealGps && !parsed.isIpFallback && !parsed.name?.toLowerCase().includes('royapuram')) {
          return parsed;
        }
      }
    } catch (e) {}
    return {
      lat: 11.75,
      lng: 79.77,
      name: 'Awaiting Live GPS Permission...',
      isDetected: false,
    };
  });

  const [gpsPermissionStatus, setGpsPermissionStatus] = useState('prompt'); // 'prompt' | 'granted' | 'denied'
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [selectedSearchLocation, setSelectedSearchLocation] = useState(null);

  // ── Core State with Local Storage Persistence ──────────────────────────────
  const [disasters, setDisasters] = useState(() => {
    try {
      const saved = localStorage.getItem('resqai_disasters');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [alerts, setAlerts] = useState(() => {
    try {
      const saved = localStorage.getItem('resqai_alerts');
      return saved ? JSON.parse(saved) : initialAlerts;
    } catch (e) {
      return initialAlerts;
    }
  });

  const [teams, setTeams] = useState(() => {
    try {
      const saved = localStorage.getItem('resqai_teams');
      return saved ? JSON.parse(saved) : resqTeams;
    } catch (e) {
      return resqTeams;
    }
  });

  const [hospitals, setHospitals] = useState(() => {
    try {
      const saved = localStorage.getItem('resqai_hospitals');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 20) {
          return parsed;
        }
      }
      return initialHospitals;
    } catch (e) {
      return initialHospitals;
    }
  });

  const [completedMissions, setCompletedMissions] = useState(() => {
    try {
      const saved = localStorage.getItem('resqai_completed_missions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [sosBeacons, setSosBeacons] = useState(() => {
    try {
      const saved = localStorage.getItem('resqai_sos_beacons');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [aiDecisions, setAiDecisions] = useState(() => {
    try {
      const saved = localStorage.getItem('resqai_ai_decisions');
      return saved ? JSON.parse(saved) : initialAiDecisions;
    } catch (e) {
      return initialAiDecisions;
    }
  });
  const [dispatchedAmbulances, setDispatchedAmbulances] = useState(() => {
    try {
      const saved = localStorage.getItem('resqai_dispatched_ambulances');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [criticalAlert, setCriticalAlert] = useState(null); // disaster object when risk > 75%
  const [notifications, setNotifications] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [hospitalRoutes, setHospitalRoutes] = useState([]);

  // Field Tasks State (with localStorage persistence)
  const defaultTasks = [];

  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('resqai_tasks');
      return saved ? JSON.parse(saved) : defaultTasks;
    } catch (e) {
      return defaultTasks;
    }
  });

  // Filters
  const [alertFilter, setAlertFilter] = useState('all');
  const [aiFilter, setAiFilter] = useState('all');

  // ── Sync to LocalStorage ───────────────────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem('resqai_user_location', JSON.stringify(userLocation));
    } catch (e) {}
  }, [userLocation]);

  useEffect(() => {
    try {
      localStorage.setItem('resqai_disasters', JSON.stringify(disasters));
    } catch (e) {}
  }, [disasters]);

  useEffect(() => {
    try {
      localStorage.setItem('resqai_teams', JSON.stringify(teams));
    } catch (e) {}
  }, [teams]);

  useEffect(() => {
    try {
      localStorage.setItem('resqai_alerts', JSON.stringify(alerts));
    } catch (e) {}
  }, [alerts]);

  useEffect(() => {
    try {
      localStorage.setItem('resqai_hospitals', JSON.stringify(hospitals));
    } catch (e) {}
  }, [hospitals]);

  useEffect(() => {
    try {
      localStorage.setItem('resqai_completed_missions', JSON.stringify(completedMissions));
    } catch (e) {}
  }, [completedMissions]);

  useEffect(() => {
    try {
      localStorage.setItem('resqai_sos_beacons', JSON.stringify(sosBeacons));
    } catch (e) {}
  }, [sosBeacons]);

  useEffect(() => {
    try {
      localStorage.setItem('resqai_tasks', JSON.stringify(tasks));
    } catch (e) {}
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('resqai_dispatched_ambulances', JSON.stringify(dispatchedAmbulances));
    } catch (e) {}
  }, [dispatchedAmbulances]);

  // ── Continuous Live GPS Tracking Loop & Telemetry ────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem('resqai_ai_decisions', JSON.stringify(aiDecisions));
    } catch (e) {
      console.warn('Failed to save AI decisions to local storage', e);
    }
  }, [aiDecisions]);

  const [isLiveTracking, setIsLiveTracking] = useState(true);
  const [gpsTrackerTelemetry, setGpsTrackerTelemetry] = useState({
    speed: 0,
    heading: 0,
    accuracy: 10,
    altitude: null,
    movementState: 'STATIONARY',
    lastPing: new Date().toISOString(),
    breadcrumbs: [],
  });

  const prevCoordRef = useRef({ lat: userLocation.lat, lng: userLocation.lng });
  const isGeocodingRef = useRef(false);

  // ── Check Browser Permissions on Mount ────────
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.permissions?.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setGpsPermissionStatus(result.state);
        if (result.state === 'granted') {
          detectUserLocation().catch(() => {});
        }
        result.onchange = () => {
          setGpsPermissionStatus(result.state);
          if (result.state === 'granted') {
            detectUserLocation().catch(() => {});
          }
        };
      }).catch(() => {});
    }
  }, []);

  // ── Real-Time Watch Position GPS Tracker ───────────────────────────────────
  useEffect(() => {
    if (!isLiveTracking || typeof window === 'undefined' || !navigator.geolocation) return;
    if (gpsPermissionStatus === 'denied' || (!userLocation.isDetected && gpsPermissionStatus === 'prompt')) {
      return;
    }

    let watchId = null;

    const onPosSuccess = async (pos) => {
      const { latitude, longitude, accuracy, speed, heading, altitude } = pos.coords;
      const prev = prevCoordRef.current;
      const distMoved = calculateDistanceKm(prev.lat, prev.lng, latitude, longitude);

      const speedKmh = speed != null ? Math.round(speed * 3.6) : 0;
      const isMoving = (speedKmh > 1) || (distMoved > 0.04);

      setGpsTrackerTelemetry((t) => ({
        ...t,
        speed: speedKmh,
        heading: heading != null ? Math.round(heading) : t.heading,
        accuracy: Math.round(accuracy),
        altitude: altitude != null ? Math.round(altitude) : t.altitude,
        movementState: isMoving ? 'IN MOTION' : 'STATIONARY',
        lastPing: new Date().toISOString(),
      }));

      // If user moved > 40 meters or first detection:
      if (!userLocation.isDetected || distMoved >= 0.04) {
        if (isGeocodingRef.current) return;
        isGeocodingRef.current = true;
        prevCoordRef.current = { lat: latitude, lng: longitude };

        try {
          const newLoc = await reverseGeocodeCoordinates(latitude, longitude, accuracy);
          setUserLocation((curr) => {
            const hasZoneChanged = curr?.zone?.code !== newLoc.zone?.code;
            if (hasZoneChanged && curr.isDetected) {
              showNotification({
                id: Date.now(),
                type: 'system',
                title: '📍 SECTOR BOUNDARY CROSSED',
                message: `Transitioned into ${newLoc.name} (${newLoc.zone?.code || 'ZONE'})`,
                severity: 'info',
                timestamp: new Date().toISOString(),
              });
            }
            return {
              ...newLoc,
              isDetected: true,
              isRealGps: accuracy < 2500,
            };
          });

          // Append to breadcrumbs trail
          setGpsTrackerTelemetry((t) => ({
            ...t,
            breadcrumbs: [
              ...t.breadcrumbs.slice(-30),
              { lat: latitude, lng: longitude, name: newLoc.name, time: new Date().toISOString() },
            ],
          }));
        } catch (e) {
          console.warn('Live tracker reverse geocode failed:', e);
        } finally {
          isGeocodingRef.current = false;
        }
      }
    };

    const onPosError = (err) => {
      console.warn('Live GPS tracker error:', err.message);
    };

    watchId = navigator.geolocation.watchPosition(onPosSuccess, onPosError, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000,
    });

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isLiveTracking, userLocation.isDetected]);

  // ── Manual & Movement Simulation Helper (For Testing Movement) ─────────────
  const simulateGpsMovement = async (newLat, newLng, customNameHint = null) => {
    prevCoordRef.current = { lat: newLat, lng: newLng };
    const loc = await reverseGeocodeCoordinates(newLat, newLng, 8, customNameHint);
    const updated = {
      ...loc,
      isDetected: true,
      isRealGps: true,
    };
    setUserLocation(updated);
    setSelectedSearchLocation(null);
    setGpsTrackerTelemetry((t) => ({
      ...t,
      movementState: 'IN MOTION',
      lastPing: new Date().toISOString(),
      breadcrumbs: [
        ...t.breadcrumbs.slice(-30),
        { lat: newLat, lng: newLng, name: loc.name, time: new Date().toISOString() },
      ],
    }));
    try {
      localStorage.setItem('resqai_user_location', JSON.stringify(updated));
    } catch (e) {}
    showNotification({
      id: Date.now(),
      type: 'system',
      title: '🛰️ GPS TRACKER POSITION DISPLACED',
      message: `Sector relocated to ${loc.name}. Threat Zone: ${loc.zone?.code} (${loc.zone?.alertLevel}).`,
      severity: 'info',
      timestamp: new Date().toISOString(),
    });
    return updated;
  };

  // ── Location Actions ───────────────────────────────────────────────────────
  const detectUserLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const loc = await getUserCurrentLocation();
      setUserLocation(loc);
      setGpsPermissionStatus('granted');
      setSelectedSearchLocation(null);
      prevCoordRef.current = { lat: loc.lat, lng: loc.lng };
      showNotification({
        id: Date.now(),
        type: 'system',
        title: '🛰️ LIVE GPS ACCESS GRANTED',
        message: `Command origin locked to ${loc.name} (${loc.zone?.code || 'ZONE'}).`,
        severity: 'info',
        timestamp: new Date().toISOString(),
      });
      return loc;
    } catch (err) {
      console.warn('Geolocation detection:', err.message);
      if (err.message?.toLowerCase().includes('denied')) {
        setGpsPermissionStatus('denied');
      }
      showNotification({
        id: Date.now(),
        type: 'alert',
        title: 'GPS PERMISSION STATUS',
        message: err.message || 'Please click "Allow" when prompted by your browser to track live GPS location.',
        severity: 'warning',
        timestamp: new Date().toISOString(),
      });
      return null;
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const setSearchLocation = (location) => {
    setSelectedSearchLocation(location);
    if (location) {
      showNotification({
        id: Date.now(),
        type: 'system',
        title: '📍 LOCATION FOCUSED',
        message: `Analyzing risk & medical distance for ${location.name}`,
        severity: 'info',
        timestamp: new Date().toISOString(),
      });
    }
  };

  const setUserExactLocation = (location) => {
    const verifiedLocation = {
      ...location,
      isDetected: true,
      isUserConfirmed: true,
    };
    setUserLocation(verifiedLocation);
    setSelectedSearchLocation(null);
    prevCoordRef.current = { lat: location.lat, lng: location.lng };
    try {
      localStorage.setItem('resqai_user_location', JSON.stringify(verifiedLocation));
    } catch (e) {}
    showNotification({
      id: Date.now(),
      type: 'system',
      title: '📍 GPS TRACKER CALIBRATED',
      message: `Tracker origin calibrated to ${location.name} (${location.zone?.code || 'ZONE'}).`,
      severity: 'info',
      timestamp: new Date().toISOString(),
    });
  };

  // ── Disasters Actions ──────────────────────────────────────────────────────
  const addDisaster = (disaster) => {
    const nearest = getNearestHospitalForLocation(disaster.lat, disaster.lng);
    const enrichedDisaster = {
      ...disaster,
      nearestHospitalId: nearest?.id || null,
      nearestHospitalName: nearest?.name || null,
      nearestHospitalDistance: nearest?.distance ? parseFloat(nearest.distance.toFixed(1)) : null,
    };
    setDisasters((prev) => [...prev, enrichedDisaster]);

    const alert = {
      id: `alert-${disaster.id}`,
      disasterId: disaster.id,
      area: disaster.areaName,
      type: disaster.type,
      priority: disaster.severity === 'critical' ? 'P1' : disaster.severity === 'high' ? 'P2' : 'P3',
      message: disaster.description || `${disaster.type} detected in ${disaster.areaName}`,
      timestamp: disaster.timestamp,
      status: 'active',
      riskPercent: disaster.riskPercent,
      lat: disaster.lat,
      lng: disaster.lng,
    };

    setAlerts((prev) => [alert, ...prev]);

    const aiDecision = {
      id: `decision-${disaster.id}`,
      disasterId: disaster.id,
      timestamp: disaster.timestamp,
      type: disaster.type,
      area: disaster.areaName,
      module: 'AI Decision Engine',
      decision: `Analyzing ${disaster.type} in ${disaster.areaName}...`,
      confidence: 0,
      reasoning: 'AI is analyzing disaster data...',
      algorithm: 'ResQAI LLM Decision Engine v2.0',
      dataPoints: 0,
      status: 'analyzing',
      affectedPopulation: 0,
      recommendedTeams: 0,
      priorityActions: [],
      evacuationNeeded: false,
      alertLevel: 'P3',
      previousRisk: disaster.previousRisk || 0,
      newRisk: disaster.riskPercent || 0,
    };

    setAiDecisions((prev) => [aiDecision, ...prev]);

    analyzeDisasterWithAI(disaster, { teams, hospitals })
      .then((result) => {
        if (result.success) {
          setAiDecisions((prev) =>
            prev.map((d) =>
              d.id === aiDecision.id
                ? {
                    ...d,
                    decision: result.decision,
                    confidence: result.confidence,
                    reasoning: result.reasoning,
                    dataPoints: Math.floor(50 + Math.random() * 200),
                    status: 'pending',
                    affectedPopulation: result.estimatedAffectedPopulation,
                    recommendedTeams: result.recommendedTeams,
                    priorityActions: result.priorityActions,
                    evacuationNeeded: result.evacuationNeeded,
                    alertLevel: result.alertLevel,
                    estimatedResponseTime: result.estimatedResponseTime,
                    riskTrend: result.riskTrend,
                    aiAnalyzedAt: new Date().toISOString(),
                  }
                : d
            )
          );
          showNotification({
            id: Date.now(),
            type: 'ai',
            title: 'AI ANALYSIS COMPLETE',
            message: `AI Decision Engine analyzed ${disaster.type} in ${disaster.areaName} (${result.confidence}% confidence)`,
            severity: 'info',
            timestamp: new Date().toISOString(),
          });
        } else {
          setAiDecisions((prev) =>
            prev.map((d) =>
              d.id === aiDecision.id
                ? {
                    ...d,
                    decision: `Deploy emergency response to ${disaster.areaName}`,
                    confidence: Math.floor(75 + Math.random() * 20),
                    reasoning: `Fallback analysis: ${disaster.type} detected at ${disaster.riskPercent}% risk. AI engine unavailable — using rule-based assessment. Recommend immediate response based on severity and population density.`,
                    dataPoints: Math.floor(10 + Math.random() * 50),
                    status: 'pending',
                    affectedPopulation: Math.floor(Math.random() * 100000) + 15000,
                    recommendedTeams: Math.floor(Math.random() * 3) + 1,
                    alertLevel: disaster.riskPercent >= 70 ? 'P1' : disaster.riskPercent >= 50 ? 'P2' : 'P3',
                    algorithm: 'Rule-Based Fallback v1.0',
                  }
                : d
            )
          );
        }
      })
      .catch(() => {
        setAiDecisions((prev) =>
          prev.map((d) =>
            d.id === aiDecision.id
              ? {
                  ...d,
                  decision: `Deploy emergency response to ${disaster.areaName}`,
                  confidence: Math.floor(70 + Math.random() * 15),
                  reasoning: `Rule-based fallback: ${disaster.type} with ${disaster.riskPercent}% risk level detected. AI engine offline — using heuristic assessment.`,
                  dataPoints: Math.floor(5 + Math.random() * 20),
                  status: 'pending',
                  affectedPopulation: Math.floor(Math.random() * 80000) + 10000,
                  recommendedTeams: Math.ceil(disaster.riskPercent / 30),
                  algorithm: 'Rule-Based Fallback v1.0',
                }
              : d
          )
        );
      });

    showNotification({
      id: Date.now(),
      type: 'disaster',
      title: `${disaster.type.toUpperCase()} DETECTED`,
      message: `${disaster.areaName} - Risk: ${disaster.riskPercent}%`,
      severity: disaster.severity,
      timestamp: disaster.timestamp,
    });

    // Trigger critical alert modal + auto push notifications if risk > 75%
    if ((disaster.riskPercent || 0) > 75) {
      setCriticalAlert(disaster);
      // Fire push notifications automatically — no user click needed
      sendCommanderAlert(disaster);
      sendCitizenAlert(disaster);
    }

    return enrichedDisaster;
  };

  const removeDisaster = (disasterId) => {
    setDisasters((prev) => prev.filter((d) => String(d.id) !== String(disasterId)));

    setAlerts((prev) => prev.filter((a) => String(a.disasterId) !== String(disasterId)));

    setAiDecisions((prev) =>
      prev.map(decision =>
        (String(decision.disasterId) === String(disasterId) && decision.status === 'pending')
          ? {
              ...decision,
              status: 'rejected',
              reviewedAt: new Date().toISOString(),
              comment: 'Auto-closed: Disaster was manually resolved by commander'
            }
          : decision
      )
    );

    setTeams((prev) =>
      prev.map((t) =>
        t.disasterId && String(t.disasterId) === String(disasterId)
          ? { ...t, disasterId: null }
          : t
      )
    );

    restoreAmbulances(disasterId);
  };

  const updateAlertStatus = (alertId, status) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, status } : alert)));
  };

  const updateAiDecision = (decisionId, status, comment = '') => {
    const decision = aiDecisions.find((d) => d.id === decisionId);

    setAiDecisions((prev) =>
      prev.map((d) =>
        d.id === decisionId
          ? {
              ...d,
              status,
              reviewedAt: new Date().toISOString(),
              comment,
              approvedBy: status === 'approved' ? 'Controller-Admin' : d.approvedBy,
              approvedAt: status === 'approved' ? new Date().toISOString() : d.approvedAt,
            }
          : d
      )
    );

    if (status === 'approved' && decision) {
      executePostApprovalPipeline(decision);
    }
  };

  const executePostApprovalPipeline = (decision) => {
    const area = decision.area;
    const type = decision.type || 'disaster';
    const teamsNeeded = decision.recommendedTeams || 1;
    const actions = decision.priorityActions || [];
    const needsEvacuation = decision.evacuationNeeded || false;
    const alertLevel = decision.alertLevel || 'P3';

    const matchedDisaster = disasters.find(
      (d) => d.areaName === area && d.status !== 'completed'
    );

    // ── Step 1: Deploy the AI-recommended number of teams ──────────────────
    const deployedTeamInfo = [];
    let teamsDeployed = 0;
    const standbyTeams = teams.filter((t) => t.status === 'standby');

    for (let i = 0; i < Math.min(teamsNeeded, standbyTeams.length); i++) {
      const team = standbyTeams[i];
      const mission = `AI-approved ${type} response — ${alertLevel}`;
      deployTeam(team.id, area, mission, matchedDisaster?.id || null);
      deployedTeamInfo.push({ name: team.name, leader: team.leader || '' });
      teamsDeployed++;

      sendDeployAlert(team, area, mission);
    }

    const deployedTeamNames = deployedTeamInfo.map((t) => t.name);

    // ── Step 2: Dispatch ambulance from nearest hospital ───────────────────
    let ambulanceDispatched = false;
    if (matchedDisaster && matchedDisaster.lat && matchedDisaster.lng) {
      const nearest = getNearestHospitalForLocation(matchedDisaster.lat, matchedDisaster.lng);
      if (nearest && nearest.id) {
        ambulanceDispatched = dispatchAmbulance(nearest.id, area, matchedDisaster.id);
      }
    } else {
      const hospitalsWithDist = getHospitalsWithDistance();
      if (hospitalsWithDist.length > 0 && hospitalsWithDist[0].ambulances > 0) {
        ambulanceDispatched = dispatchAmbulance(hospitalsWithDist[0].id, area, matchedDisaster?.id || null);
      }
    }

    // ── Step 3: AI-generated field tasks (async, like disaster analysis) ────
    // Create placeholder tasks immediately, then replace with AI-generated ones
    const placeholderTaskId = `task-ai-${Date.now()}`;
    const placeholderTask = {
      id: placeholderTaskId,
      title: `Generating field tasks for ${area}...`,
      description: 'AI Task Engine is analyzing the approved decision and generating detailed field tasks...',
      location: area,
      priority: alertLevel === 'P1' ? 'immediate' : alertLevel === 'P2' ? 'high' : 'medium',
      category: 'Reconnaissance',
      status: 'pending',
      assignedTeam: deployedTeamInfo[0]?.name || 'Unassigned',
      assignedLeader: deployedTeamInfo[0]?.leader || '',
      createdAt: new Date().toISOString(),
      aiGenerated: true,
      aiAnalyzing: true,
      decisionId: decision.id,
    };

    setTasks((prev) => [placeholderTask, ...prev]);

    generateFieldTasksWithAI(decision, {
      teams,
      area,
      type,
      alertLevel,
      deployedTeamNames,
    })
      .then((result) => {
        // Remove placeholder
        setTasks((prev) => prev.filter((t) => t.id !== placeholderTaskId));

        if (result.success && result.tasks.length > 0) {
          const aiTasks = result.tasks.map((aiTask, idx) => {
            const teamIdx = idx % (deployedTeamInfo.length || 1);
            const assigned = deployedTeamInfo[teamIdx] || { name: 'Unassigned', leader: '' };
            return {
              id: `task-ai-${Date.now()}-${idx}`,
              title: aiTask.title,
              description: aiTask.description,
              location: area,
              priority: aiTask.priority,
              category: aiTask.category,
              status: 'pending',
              assignedTeam: assigned.name,
              assignedLeader: assigned.leader,
              createdAt: new Date().toISOString(),
              aiGenerated: true,
              decisionId: decision.id,
              estimatedDuration: aiTask.estimatedDuration || '',
              personnelNeeded: aiTask.personnelNeeded || 0,
              equipment: aiTask.equipment || '',
              notes: aiTask.notes || '',
            };
          });

          setTasks((prev) => [...aiTasks, ...prev]);

          showNotification({
            id: Date.now(),
            type: 'ai',
            title: 'AI FIELD TASKS GENERATED',
            message: `${aiTasks.length} detailed tasks created for ${area} by AI Task Engine`,
            severity: 'info',
            timestamp: new Date().toISOString(),
          });
        } else {
          // Fallback: create basic tasks from priorityActions
          const fallbackTasks = actions.map((action, idx) => {
            const teamIdx = idx % (deployedTeamInfo.length || 1);
            const assigned = deployedTeamInfo[teamIdx] || { name: 'Unassigned', leader: '' };
            return {
              id: `task-fb-${Date.now()}-${idx}`,
              title: action,
              description: `Task from AI decision for ${area}. ${decision.reasoning || ''}`,
              location: area,
              priority: alertLevel === 'P1' ? 'immediate' : alertLevel === 'P2' ? 'high' : 'medium',
              category: 'Reconnaissance',
              status: 'pending',
              assignedTeam: assigned.name,
              assignedLeader: assigned.leader,
              createdAt: new Date().toISOString(),
              aiGenerated: true,
              decisionId: decision.id,
            };
          });
          if (fallbackTasks.length > 0) {
            setTasks((prev) => [...fallbackTasks, ...prev]);
          }
        }
      })
      .catch(() => {
        // On error: remove placeholder, create basic fallback tasks
        setTasks((prev) => prev.filter((t) => t.id !== placeholderTaskId));
        if (actions.length > 0) {
          const fallbackTasks = actions.map((action, idx) => {
            const teamIdx = idx % (deployedTeamInfo.length || 1);
            const assigned = deployedTeamInfo[teamIdx] || { name: 'Unassigned', leader: '' };
            return {
              id: `task-fb-${Date.now()}-${idx}`,
              title: action,
              description: `Task from AI decision for ${area}. ${decision.reasoning || ''}`,
              location: area,
              priority: alertLevel === 'P1' ? 'immediate' : alertLevel === 'P2' ? 'high' : 'medium',
              category: 'Reconnaissance',
              status: 'pending',
              assignedTeam: assigned.name,
              assignedLeader: assigned.leader,
              createdAt: new Date().toISOString(),
              aiGenerated: true,
              decisionId: decision.id,
            };
          });
          setTasks((prev) => [...fallbackTasks, ...prev]);
        }
      });

    // ── Step 4: Send push notifications to commanders and citizens ─────────
    if (matchedDisaster) {
      sendCommanderAlert({
        ...matchedDisaster,
        description:
          `AI DECISION APPROVED (${alertLevel}): ${decision.decision}\n` +
          `Teams deployed: ${deployedTeamNames.join(', ') || 'None available'}\n` +
          `Ambulance: ${ambulanceDispatched ? 'Dispatched' : 'None available'}`,
      });

      if (alertLevel === 'P1' || alertLevel === 'P2') {
        sendCitizenAlert(matchedDisaster);
      }
    }

    // ── Step 5: Trigger evacuation alert if AI recommended it ──────────────
    if (needsEvacuation && matchedDisaster) {
      setCriticalAlert({
        ...matchedDisaster,
        description: `EVACUATION ORDERED by AI Decision Engine — ${decision.decision}`,
      });

      showNotification({
        id: Date.now() + 1,
        type: 'alert',
        title: 'EVACUATION TRIGGERED',
        message: `AI recommended evacuation for ${area}. Estimated ${(decision.affectedPopulation || 0).toLocaleString()} people affected.`,
        severity: 'critical',
        timestamp: new Date().toISOString(),
      });

      sendCitizenAlert({
        ...matchedDisaster,
        type: `EVACUATION — ${matchedDisaster.type}`,
      });
    }

    // ── Summary notification ───────────────────────────────────────────────
    showNotification({
      id: Date.now() + 2,
      type: 'ai',
      title: 'POST-APPROVAL PIPELINE EXECUTING',
      message: [
        `${teamsDeployed} team${teamsDeployed !== 1 ? 's' : ''} deployed`,
        ambulanceDispatched ? 'ambulance dispatched' : null,
        'AI generating field tasks...',
        'alerts sent',
        needsEvacuation ? 'EVACUATION triggered' : null,
      ].filter(Boolean).join(' · '),
      severity: 'info',
      timestamp: new Date().toISOString(),
    });
  };

  const reanalyzeAiDecision = async (decisionId) => {
    const decision = aiDecisions.find((d) => d.id === decisionId);
    if (!decision || decision.status !== 'pending') return;

    setAiDecisions((prev) =>
      prev.map((d) =>
        d.id === decisionId ? { ...d, status: 'analyzing', reasoning: 'AI is re-analyzing...' } : d
      )
    );

    try {
      const result = await reanalyzeDecision(decision, { teams, hospitals });
      if (result.success) {
        setAiDecisions((prev) =>
          prev.map((d) =>
            d.id === decisionId
              ? {
                  ...d,
                  decision: result.decision,
                  confidence: result.confidence,
                  reasoning: result.reasoning,
                  status: 'pending',
                  recommendedTeams: result.recommendedTeams,
                  priorityActions: result.priorityActions || [],
                  evacuationNeeded: result.evacuationNeeded,
                  alertLevel: result.alertLevel,
                  riskTrend: result.riskTrend,
                  aiAnalyzedAt: new Date().toISOString(),
                  reanalyzed: true,
                }
              : d
          )
        );
        showNotification({
          id: Date.now(),
          type: 'ai',
          title: 'AI RE-ANALYSIS COMPLETE',
          message: `Updated analysis for ${decision.area} (${result.confidence}% confidence)`,
          severity: 'info',
          timestamp: new Date().toISOString(),
        });
      } else {
        setAiDecisions((prev) =>
          prev.map((d) => (d.id === decisionId ? { ...d, status: 'pending' } : d))
        );
      }
    } catch {
      setAiDecisions((prev) =>
        prev.map((d) => (d.id === decisionId ? { ...d, status: 'pending' } : d))
      );
    }
  };

  const logAiAction = (moduleName, decisionText, reasoningText, status = 'approved') => {
    const aiDecision = {
      id: `ai-${Date.now()}`,
      timestamp: new Date().toISOString(),
      module: moduleName,
      decision: decisionText,
      reasoning: reasoningText,
      status: status,
      confidence: Math.floor(85 + Math.random() * 15),
      dataPoints: Math.floor(10 + Math.random() * 200),
      algorithm: 'ResQ Copilot LLM Engine v1.0',
      approvedBy: status === 'approved' ? 'Auto-Copilot' : null,
      approvedAt: status === 'approved' ? new Date().toISOString() : null,
    };
    setAiDecisions((prev) => [aiDecision, ...prev]);
  };

  // ── Team Management ────────────────────────────────────────────────────────

  const deployTeam = (teamId, location, mission = 'Emergency rescue deployment', disasterId = null) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return false;

    const matchedDisaster = disasterId
      ? disasters.find((d) => String(d.id) === String(disasterId))
      : disasters.find((d) => d.areaName === location && d.status === 'active');

    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId
          ? {
              ...t,
              status: 'deployed',
              location,
              assignedArea: location,
              mission,
              deployedAt: new Date().toISOString(),
              disasterId: matchedDisaster ? matchedDisaster.id : null,
            }
          : t
      )
    );

    if (matchedDisaster) {
      setDisasters((prev) =>
        prev.map((d) =>
          String(d.id) === String(matchedDisaster.id)
            ? {
                ...d,
                status: 'assigned',
                assignedTeamId: teamId,
                assignedTeamName: team.name,
              }
            : d
        )
      );
    }

    showNotification({
      id: Date.now(),
      type: 'team',
      title: 'TEAM DEPLOYED',
      message: `${team.name} (${team.members} personnel) dispatched to ${location}`,
      severity: 'high',
      timestamp: new Date().toISOString(),
    });

    setAiDecisions((prev) =>
      prev.map(decision =>
        (decision.status === 'pending' && decision.area === location)
          ? {
              ...decision,
              status: 'approved',
              approvedBy: 'Auto-Copilot',
              approvedAt: new Date().toISOString(),
              comment: `Auto-approved by team deployment to ${location}`
            }
          : decision
      )
    );

    return true;
  };

  const autoDeployTeam = (area, disasterType) => {
    const availableTeam = teams.find((t) => t.status === 'standby');
    if (availableTeam) {
      const matchedDisaster = disasters.find((d) => d.areaName === area && d.status === 'active');
      deployTeam(availableTeam.id, area, `${disasterType} response operation`, matchedDisaster?.id || null);
    }
  };

  const completeDisaster = (disasterId) => {
    const disaster = disasters.find((d) => String(d.id) === String(disasterId));
    if (!disaster) return;

    setDisasters((prev) =>
      prev.map((d) =>
        String(d.id) === String(disasterId)
          ? { ...d, status: 'completed', completedAt: new Date().toISOString() }
          : d
      )
    );

    setAlerts((prev) =>
      prev.map((a) =>
        String(a.disasterId) === String(disasterId)
          ? { ...a, status: 'resolved' }
          : a
      )
    );

    setAiDecisions((prev) =>
      prev.map((decision) =>
        String(decision.disasterId) === String(disasterId) && decision.status === 'pending'
          ? { ...decision, status: 'approved', approvedBy: 'Auto-Copilot', approvedAt: new Date().toISOString(), comment: 'Auto-approved: Disaster resolved' }
          : decision
      )
    );

    const assignedTeam = teams.find((t) => t.disasterId && String(t.disasterId) === String(disasterId) && t.status === 'deployed');
    if (assignedTeam) {
      completeMission(assignedTeam.id, `Disaster in ${disaster.areaName} resolved successfully.`);
    }

    restoreAmbulances(disasterId);

    showNotification({
      id: Date.now(),
      type: 'disaster',
      title: 'DISASTER RESOLVED',
      message: `${disaster.type.toUpperCase()} in ${disaster.areaName} marked as completed.`,
      severity: 'info',
      timestamp: new Date().toISOString(),
    });
  };

  const recallTeam = (teamId) => {
    const team = teams.find((t) => t.id === teamId);

    // If team was assigned to a disaster, complete it when recalling
    if (team && team.disasterId) {
      const disaster = disasters.find((d) => String(d.id) === String(team.disasterId));
      if (disaster && disaster.status !== 'completed') {
        setDisasters((prev) =>
          prev.map((d) =>
            String(d.id) === String(team.disasterId)
              ? { ...d, status: 'completed', completedAt: new Date().toISOString() }
              : d
          )
        );

        setAlerts((prev) =>
          prev.map((a) =>
            String(a.disasterId) === String(team.disasterId)
              ? { ...a, status: 'resolved' }
              : a
          )
        );

        setAiDecisions((prev) =>
          prev.map((decision) =>
            String(decision.disasterId) === String(team.disasterId) && decision.status === 'pending'
              ? { ...decision, status: 'approved', approvedBy: 'Auto-Copilot', approvedAt: new Date().toISOString(), comment: 'Auto-approved: Team recalled' }
              : decision
          )
        );

        restoreAmbulances(team.disasterId);
      }
    }

    setTeams((prev) =>
      prev.map((team) =>
        team.id === teamId
          ? { ...team, status: 'standby', location: 'Base', mission: 'Standby', deployedAt: null, disasterId: null }
          : team
      )
    );
  };

  const completeMission = (teamId, report = '', civiliansSaved = 0) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;

    const missionRecord = {
      id: `mission-${Date.now()}`,
      teamId: team.id,
      teamName: team.name,
      area: team.location || 'Active Zone',
      mission: team.mission || 'Response mission',
      deployedAt: team.deployedAt || new Date(Date.now() - 3600000).toISOString(),
      completedAt: new Date().toISOString(),
      personnelInvolved: team.members,
      civiliansRescued: Number(civiliansSaved) || Math.floor(Math.random() * 50) + 12,
      notes: report || 'Rescue mission successfully concluded with all resources accounted for.',
      status: 'completed',
    };

    setCompletedMissions((prev) => [missionRecord, ...prev]);

    // Automatically complete associated disaster if team was assigned to one
    if (team.disasterId) {
      const disaster = disasters.find((d) => String(d.id) === String(team.disasterId));
      if (disaster && disaster.status !== 'completed') {
        setDisasters((prev) =>
          prev.map((d) =>
            String(d.id) === String(team.disasterId)
              ? { ...d, status: 'completed', completedAt: new Date().toISOString() }
              : d
          )
        );

        setAlerts((prev) =>
          prev.map((a) =>
            String(a.disasterId) === String(team.disasterId)
              ? { ...a, status: 'resolved' }
              : a
          )
        );

        setAiDecisions((prev) =>
          prev.map((decision) =>
            String(decision.disasterId) === String(team.disasterId) && decision.status === 'pending'
              ? { ...decision, status: 'approved', approvedBy: 'Auto-Copilot', approvedAt: new Date().toISOString(), comment: 'Auto-approved: Mission completed' }
              : decision
          )
        );

        restoreAmbulances(team.disasterId);
      }
    }

    recallTeam(teamId);

    showNotification({
      id: Date.now(),
      type: 'team',
      title: 'MISSION CONCLUDED',
      message: `${team.name} completed mission in ${missionRecord.area}. ${team.disasterId ? 'Disaster marked as resolved.' : 'Resources returned to standby.'}`,
      severity: 'info',
      timestamp: new Date().toISOString(),
    });

    return missionRecord;
  };

  // ── Hospital Actions ────────────────────────────────────────────────────────

  const getNearestHospitalForLocation = (lat, lng) => {
    let nearest = null;
    let minDist = Infinity;
    hospitals.forEach((h) => {
      const dist = calculateDistanceKm(lat, lng, h.lat, h.lng);
      if (dist !== null && dist < minDist) {
        minDist = dist;
        nearest = { ...h, distance: dist };
      }
    });
    return nearest;
  };

  const dispatchAmbulance = (hospitalId, destinationArea = 'Emergency Site', disasterId = null) => {
    let dispatched = false;
    let hospName = '';

    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id === hospitalId && h.ambulances > 0) {
          dispatched = true;
          hospName = h.name;
          return { ...h, ambulances: h.ambulances - 1 };
        }
        return h;
      })
    );

    if (dispatched) {
      setDispatchedAmbulances((prev) => [
        ...prev,
        {
          id: `amb-${Date.now()}`,
          hospitalId,
          hospitalName: hospName,
          destinationArea,
          disasterId: disasterId || null,
          dispatchedAt: new Date().toISOString(),
          status: 'dispatched',
        },
      ]);

      showNotification({
        id: Date.now(),
        type: 'ambulance',
        title: 'AMBULANCE DISPATCHED',
        message: `Ambulance en route from ${hospName} to ${destinationArea}`,
        severity: 'high',
        timestamp: new Date().toISOString(),
      });
      return true;
    }
    return false;
  };

  const restoreAmbulances = (disasterId) => {
    const toRestore = dispatchedAmbulances.filter(
      (a) => String(a.disasterId) === String(disasterId) && a.status === 'dispatched'
    );
    if (toRestore.length === 0) return;

    const restoreCounts = {};
    toRestore.forEach((a) => {
      restoreCounts[a.hospitalId] = (restoreCounts[a.hospitalId] || 0) + 1;
    });

    setHospitals((prev) =>
      prev.map((h) =>
        restoreCounts[h.id]
          ? { ...h, ambulances: h.ambulances + restoreCounts[h.id] }
          : h
      )
    );

    setDispatchedAmbulances((prev) =>
      prev.map((a) =>
        String(a.disasterId) === String(disasterId) && a.status === 'dispatched'
          ? { ...a, status: 'returned', returnedAt: new Date().toISOString() }
          : a
      )
    );

    const totalRestored = toRestore.length;
    const hospitalNames = [...new Set(toRestore.map((a) => a.hospitalName))].join(', ');
    showNotification({
      id: Date.now(),
      type: 'ambulance',
      title: 'AMBULANCES RESTORED',
      message: `${totalRestored} ambulance${totalRestored > 1 ? 's' : ''} returned to ${hospitalNames}`,
      severity: 'info',
      timestamp: new Date().toISOString(),
    });
  };

  // ── Hospitals with Dynamic Distance — always from disaster location when active ──
  const getDistanceOrigin = () => {
    const ongoingDisasters = disasters.filter((d) => d.status !== 'completed');
    if (ongoingDisasters.length > 0) {
      const criticalDisaster = [...ongoingDisasters].sort((a, b) => (b.riskPercent || 0) - (a.riskPercent || 0))[0];
      if (criticalDisaster && criticalDisaster.lat && criticalDisaster.lng) {
        return {
          lat: criticalDisaster.lat,
          lng: criticalDisaster.lng,
          label: `${criticalDisaster.type.toUpperCase()} — ${criticalDisaster.areaName}`,
          isDisaster: true,
        };
      }
    }
    if (selectedSearchLocation) {
      return { ...selectedSearchLocation, label: selectedSearchLocation.name || 'Search Location', isDisaster: false };
    }
    return { ...userLocation, label: userLocation.name || 'Your Location', isDisaster: false };
  };

  const getHospitalsWithDistance = () => {
    const origin = getDistanceOrigin();

    return hospitals
      .map((h) => {
        const distKm = calculateDistanceKm(origin.lat, origin.lng, h.lat, h.lng);
        const finalDist = distKm != null ? distKm : h.distance || 10;
        return {
          ...h,
          distance: finalDist,
          transitEta: calculateTransitEta(finalDist),
        };
      })
      .sort((a, b) => a.distance - b.distance);
  };

  // ── SOS Distress Beacons ───────────────────────────────────────────────────
  const addSOSBeacon = (beacon) => {
    const newBeacon = {
      id: `sos-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'pending',
      ...beacon,
    };

    setSosBeacons((prev) => [newBeacon, ...prev]);

    showNotification({
      id: Date.now(),
      type: 'sos',
      title: '🚨 CITIZEN SOS BEACON',
      message: `${newBeacon.senderName} (${newBeacon.areaName}): ${newBeacon.message}`,
      severity: 'critical',
      timestamp: new Date().toISOString(),
    });

    // ── Auto-create disaster from civilian SOS → triggers full AI pipeline ──
    const sosSeverity = newBeacon.severity || 'high';
    const riskMap = { critical: 85, high: 70, medium: 50, low: 30 };
    const disasterTypeMap = {
      'trapped in building': 'flood',
      'flood': 'flood',
      'water': 'flood',
      'medical emergency': 'earthquake',
      'medical': 'earthquake',
      'cyclone': 'cyclone',
      'wind': 'cyclone',
      'storm': 'cyclone',
      'earthquake': 'earthquake',
      'fire': 'flood',
    };

    const inferType = () => {
      const msg = `${newBeacon.type || ''} ${newBeacon.message || ''}`.toLowerCase();
      for (const [keyword, dtype] of Object.entries(disasterTypeMap)) {
        if (msg.includes(keyword)) return dtype;
      }
      return 'flood';
    };

    const sosDisaster = {
      id: `sos-disaster-${Date.now()}`,
      areaName: newBeacon.areaName || 'Unknown Location',
      lat: newBeacon.lat || 12.9,
      lng: newBeacon.lng || 80.2,
      type: inferType(),
      severity: sosSeverity,
      riskPercent: riskMap[sosSeverity] || 65,
      description: `Civilian SOS from ${newBeacon.senderName}: ${newBeacon.message}`,
      timestamp: new Date().toISOString(),
      status: 'active',
      source: 'civilian',
      sosBeaconId: newBeacon.id,
      contact: newBeacon.contact || '',
      peopleCount: newBeacon.peopleCount || 1,
    };

    addDisaster(sosDisaster);

    showNotification({
      id: Date.now() + 1,
      type: 'ai',
      title: 'CIVILIAN SOS → AI PIPELINE TRIGGERED',
      message: `AI analyzing SOS from ${newBeacon.senderName} in ${newBeacon.areaName}. Check AI Admin for review.`,
      severity: 'high',
      timestamp: new Date().toISOString(),
    });

    return newBeacon;
  };

  const resolveSOSBeacon = (id, resolutionNotes = 'Assistance dispatched and civilian secured') => {
    setSosBeacons((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'resolved', resolution: resolutionNotes } : b))
    );

    showNotification({
      id: Date.now(),
      type: 'sos',
      title: 'SOS SIGNAL RESOLVED',
      message: `Distress signal #${id} marked as resolved.`,
      severity: 'info',
      timestamp: new Date().toISOString(),
    });
  };

  const assignNearestTeamToSOS = (id) => {
    const sos = sosBeacons.find((b) => b.id === id);
    if (!sos) return;

    let nearestTeam = null;
    let minDistance = Infinity;

    teams.forEach((team) => {
      const distance = calculateDistanceKm(sos.lat, sos.lng, team.lat, team.lng);
      if (distance !== null && distance < minDistance) {
        minDistance = distance;
        nearestTeam = team;
      }
    });

    if (nearestTeam) {
      setSosBeacons((prev) =>
        prev.map((b) =>
          b.id === id
            ? { ...b, status: 'assigned', assignedTeamId: nearestTeam.id, resolution: `Assigned to ${nearestTeam.name} (${minDistance.toFixed(1)} km)` }
            : b
        )
      );

      showNotification({
        id: Date.now(),
        type: 'sos',
        title: 'TEAM ASSIGNED TO SOS',
        message: `${nearestTeam.name} has been assigned to distress signal #${id} (${minDistance.toFixed(1)} km away).`,
        severity: 'info',
        timestamp: new Date().toISOString(),
      });
    }
  };


  // ── Notifications ──────────────────────────────────────────────────────────
  const showNotification = (notification) => {
    const id = notification.id
      ? `${notification.id}-${Math.random().toString(36).slice(2, 7)}`
      : `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newNotif = { ...notification, id };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 4)]);
    setTimeout(() => {
      removeNotification(id);
    }, 6000);
  };

  const addHospitalRoute = (route) => {
    setHospitalRoutes((prev) => [route, ...prev]);
  };

  const dismissCriticalAlert = () => setCriticalAlert(null);

  const removeNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const clearAllDisasters = () => {
    const activeDisasterIds = disasters
      .filter((d) => d.status !== 'completed')
      .map((d) => d.id);

    setDisasters((prev) =>
      prev.map((d) => d.status !== 'completed' ? { ...d, status: 'completed', completedAt: new Date().toISOString() } : d)
    );
    setAlerts((prev) => prev.map((a) => ({ ...a, status: 'resolved' })));

    activeDisasterIds.forEach((id) => restoreAmbulances(id));
  };

  const resetToDefaults = () => {
    localStorage.removeItem('resqai_disasters');
    localStorage.removeItem('resqai_teams');
    localStorage.removeItem('resqai_alerts');
    localStorage.removeItem('resqai_hospitals');
    localStorage.removeItem('resqai_completed_missions');
    localStorage.removeItem('resqai_sos_beacons');
    localStorage.removeItem('resqai_tasks');
    localStorage.removeItem('resqai_dispatched_ambulances');
    localStorage.removeItem('resqai_ai_decisions');
    localStorage.removeItem('resqai_user_location');

    setUserLocation({
      lat: 11.75,
      lng: 79.77,
      name: 'Cuddalore Operations HQ',
      isDetected: false,
    });
    setSelectedSearchLocation(null);
    setDisasters([]);
    setTeams(resqTeams);
    setAlerts(initialAlerts);
    setHospitals(initialHospitals);
    setCompletedMissions([]);
    setSosBeacons([]);
    setAiDecisions(initialAiDecisions);
    setTasks(defaultTasks);
    setDispatchedAmbulances([]);

    showNotification({
      id: Date.now(),
      type: 'system',
      title: 'SYSTEM RESTORED',
      message: 'All application state and persistent storage reset to defaults.',
      severity: 'info',
      timestamp: new Date().toISOString(),
    });
  };

  const getFilteredAlerts = () => {
    if (alertFilter === 'all') return alerts;
    return alerts.filter((a) => a.status === alertFilter);
  };

  const getFilteredAiDecisions = () => {
    if (aiFilter === 'all') return aiDecisions;
    return aiDecisions.filter((d) => d.status === aiFilter);
  };

  // ── Task Management Functions ──────────────────────────────────────────────
  const updateTaskStatus = (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: newStatus,
              ...(newStatus === 'in-progress' ? { startedAt: new Date().toISOString() } : {}),
            }
          : task
      )
    );

    showNotification({
      id: Date.now(),
      type: 'task',
      title: 'Task Status Updated',
      message: `Task status changed to: ${newStatus}`,
      severity: 'info',
      timestamp: new Date().toISOString(),
    });
  };

  const completeTask = (taskId, details = {}) => {
    const completedTask = tasks.find((t) => t.id === taskId);

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: 'completed',
              completedAt: new Date().toISOString(),
              completionNotes: details.notes || '',
              completedBy: details.completedBy || 'Field Officer',
            }
          : task
      )
    );

    // Return team to standby if task has an assigned team
    let associatedTeam = null;
    if (completedTask && completedTask.assignedTeam) {
      setTeams((prev) =>
        prev.map((team) => {
          // Match by partial name (e.g., "Alpha Squad" matches "Alpha Response Unit")
          const teamPrefix = completedTask.assignedTeam.split(' ')[0].toLowerCase();
          const matchesTeam = team.name.toLowerCase().includes(teamPrefix);

          if (matchesTeam && team.status === 'deployed') {
            associatedTeam = team;
            return {
              ...team,
              status: 'standby',
              assignedArea: null,
              mission: 'Standby',
              deployedAt: null,
            };
          }
          return team;
        })
      );
    }

    // Automatically complete associated disaster if task location matches a disaster
    let matchingDisaster = null;
    if (completedTask && completedTask.location) {
      matchingDisaster = disasters.find(
        (d) => d.areaName === completedTask.location && d.status !== 'completed'
      );

      if (matchingDisaster) {
        setDisasters((prev) =>
          prev.map((d) =>
            String(d.id) === String(matchingDisaster.id)
              ? { ...d, status: 'completed', completedAt: new Date().toISOString() }
              : d
          )
        );

        setAlerts((prev) =>
          prev.map((a) =>
            String(a.disasterId) === String(matchingDisaster.id)
              ? { ...a, status: 'resolved' }
              : a
          )
        );

        setAiDecisions((prev) =>
          prev.map((decision) =>
            String(decision.disasterId) === String(matchingDisaster.id) && decision.status === 'pending'
              ? { ...decision, status: 'approved', approvedBy: 'Auto-Copilot', approvedAt: new Date().toISOString(), comment: 'Auto-approved: Field task completed' }
              : decision
          )
        );

        restoreAmbulances(matchingDisaster.id);
      }
    }

    showNotification({
      id: Date.now(),
      type: 'task',
      title: 'Task Completed',
      message: `Task successfully completed${completedTask ? ` by ${completedTask.assignedTeam}` : ''}. ${matchingDisaster ? 'Disaster marked as resolved.' : 'Team returned to standby.'}`,
      severity: 'team',
      timestamp: new Date().toISOString(),
    });
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === 'pending').length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const immediate = tasks.filter((t) => t.priority === 'immediate' && t.status !== 'completed').length;

    return {
      total,
      pending,
      inProgress,
      completed,
      immediate,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  };

  // ── Resources & Stats (Without Hospital Bed references) ────────────────────
  const getResourceStats = () => {
    const totalTeams = teams.length;
    const deployedTeams = teams.filter((t) => t.status === 'deployed').length;
    const availableTeams = totalTeams - deployedTeams;

    const totalPersonnel = teams.reduce((sum, t) => sum + (t.members || 0), 0);
    const deployedPersonnel = teams
      .filter((t) => t.status === 'deployed')
      .reduce((sum, t) => sum + (t.members || 0), 0);
    const availablePersonnel = totalPersonnel - deployedPersonnel;

    const totalAmbulances = hospitals.reduce((sum, h) => sum + (h.ambulances || 0), 0);
    const emergencyFacilities = hospitals.filter((h) => h.emergency).length;

    return {
      teams: {
        total: totalTeams,
        deployed: deployedTeams,
        available: availableTeams,
      },
      personnel: {
        total: totalPersonnel,
        deployed: deployedPersonnel,
        available: availablePersonnel,
      },
      ambulances: {
        total: totalAmbulances,
      },
      facilities: {
        total: hospitals.length,
        emergencyReady: emergencyFacilities,
      },
    };
  };

  const getStats = () => {
    const ongoingDisasters = disasters.filter((d) => d.status !== 'completed');
    const activeDisasters = ongoingDisasters.length;
    const activeAlerts = alerts.filter((a) => a.status === 'active').length;
    const deployedTeams = teams.filter((t) => t.status === 'deployed').length;
    const criticalAreas = ongoingDisasters.filter((d) => d.severity === 'critical').length;
    const resources = getResourceStats();

    let overallRiskPercent = 76;
    if (ongoingDisasters.length > 0) {
      const maxDisasterRisk = Math.max(...ongoingDisasters.map((d) => d.riskPercent || 50));
      overallRiskPercent = Math.max(overallRiskPercent, maxDisasterRisk);
    }

    const hospitalsWithDist = getHospitalsWithDistance();
    const nearestHospital = hospitalsWithDist[0] || null;

    return {
      activeDisasters,
      activeAlerts,
      deployedTeams,
      criticalAreas,
      overallRiskPercent,
      totalHospitals: hospitals.length,
      nearestHospital,
      totalTeams: teams.length,
      availableTeams: resources.teams.available,
      availablePersonnel: resources.personnel.available,
      totalPersonnel: resources.personnel.total,
      totalAmbulances: resources.ambulances.total,
      pendingSosCount: sosBeacons.filter((b) => b.status === 'pending').length,
      completedMissionsCount: completedMissions.length,
    };
  };

  const getMonitoredAreasWithData = () => {
    const origin = getDistanceOrigin();
    return monitoredAreas.map((area) => {
      const areaDisasters = disasters.filter((d) => d.areaName === area.name && d.status !== 'completed');
      const hasActive = areaDisasters.length > 0;
      const maxRisk = hasActive
        ? Math.max(...areaDisasters.map((d) => d.riskPercent))
        : 0;

      const priority = hasActive
        ? (maxRisk >= 70 ? 'P1' : maxRisk >= 50 ? 'P2' : maxRisk >= 30 ? 'P3' : 'P4')
        : 'P4';

      const status = hasActive
        ? (maxRisk >= 70 ? 'critical' : maxRisk >= 50 ? 'high' : maxRisk >= 30 ? 'medium' : 'low')
        : 'monitored';

      const dist = calculateDistanceKm(origin.lat, origin.lng, area.lat, area.lng);

      return {
        ...area,
        riskPercent: maxRisk,
        priority,
        status,
        hasActiveDisaster: hasActive,
        activeDisasters: areaDisasters,
        distanceFromUserKm: dist,
      };
    });
  };

  const value = {
    // Location state & Live GPS Tracker
    userLocation,
    isDetectingLocation,
    selectedSearchLocation,
    gpsPermissionStatus,
    isLiveTracking,
    setIsLiveTracking,
    gpsTrackerTelemetry,
    simulateGpsMovement,
    detectUserLocation,
    setSearchLocation,
    setUserExactLocation,

    // Core state
    disasters,
    alerts,
    teams,
    hospitals: getHospitalsWithDistance(),
    rawHospitals: hospitals,
    distanceOrigin: getDistanceOrigin(),
    aiDecisions,
    notifications,
    criticalAlert,
    dismissCriticalAlert,
    selectedArea,
    hospitalRoutes,
    alertFilter,
    aiFilter,
    completedMissions,
    sosBeacons,
    monitoredAreas: getMonitoredAreasWithData(),
    tasks,
    dispatchedAmbulances,

    // Actions
    addDisaster,
    removeDisaster,
    completeDisaster,
    clearAllDisasters,
    updateAlertStatus,
    updateAiDecision,
    reanalyzeAiDecision,
    logAiAction,
    deployTeam,
    autoDeployTeam,
    recallTeam,
    completeMission,
    dispatchAmbulance,
    restoreAmbulances,
    getNearestHospitalForLocation,
    addSOSBeacon,
    resolveSOSBeacon,
    assignNearestTeamToSOS,
    addHospitalRoute,
    showNotification,
    removeNotification,
    setSelectedArea,
    setAlertFilter,
    setAiFilter,
    resetToDefaults,

    // Computed
    getFilteredAlerts,
    getFilteredAiDecisions,
    getStats,
    getResourceStats,

    // Task management
    updateTaskStatus,
    completeTask,
    getTaskStats,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
