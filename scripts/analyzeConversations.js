const fs = require('fs');
const path = require('path');

function analyzeConversations() {
  const logsDir = path.join(__dirname, '../logs/conversations');
  
  // Create logs directory if not exists
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    return {
      totalConversations: 0,
      commonQuestions: {},
      failedIntents: [],
      servicePopularity: {},
      timeAnalysis: {
        hourly: Array(24).fill(0),
        daily: Array(7).fill(0),
        monthly: Array(12).fill(0)
      },
      conversationFlow: {
        averageLength: 0,
        commonPaths: {},
        dropOffPoints: {}
      },
      userRetention: {},
      responseEffectiveness: {
        leadGeneration: 0,
        phoneNumbers: 0,
        appointments: 0
      }
    };
  }

  const files = fs.readdirSync(logsDir);
  let allLogs = [];
  
  // Combine all logs from different files
  files.forEach(file => {
    try {
      const fileContent = fs.readFileSync(path.join(logsDir, file));
      const logs = JSON.parse(fileContent);
      // Ensure logs is always an array
      if (Array.isArray(logs)) {
        allLogs = allLogs.concat(logs);
      } else {
        console.warn(`Invalid log format in file ${file}`);
      }
    } catch (error) {
      console.error(`Error reading file ${file}:`, error);
    }
  });

  // Now use allLogs instead of logs
  allLogs.forEach(log => {
    const timestamp = new Date(log.timestamp);
    analysis.totalConversations++;
    totalMessages++;
  
    // Existing tracking
    if (log.userMessage) {
      analysis.commonQuestions[log.userMessage] = 
        (analysis.commonQuestions[log.userMessage] || 0) + 1;
    }
  
    if (!log.intent) {
      analysis.failedIntents.push(log.userMessage);
    }
  
    if (log.intent) {
      analysis.servicePopularity[log.intent] = 
        (analysis.servicePopularity[log.intent] || 0) + 1;
    }
  
    // Time analysis
    analysis.timeAnalysis.hourly[timestamp.getHours()]++;
    analysis.timeAnalysis.daily[timestamp.getDay()]++;
    analysis.timeAnalysis.monthly[timestamp.getMonth()]++;
  
    // Track user sessions
    if (!userSessions.has(log.sender_psid)) {
      userSessions.set(log.sender_psid, {
        conversations: 1,
        lastInteraction: timestamp
      });
    } else {
      const session = userSessions.get(log.sender_psid);
      const hoursSinceLastInteraction = 
        (timestamp - session.lastInteraction) / (1000 * 60 * 60);
      
      if (hoursSinceLastInteraction > 24) {
        session.conversations++;
      }
      session.lastInteraction = timestamp;
    }
  
    // Track lead generation
    if (log.userMessage && 
        (log.userMessage.includes('0') || 
         log.userMessage.match(/\d{10,11}/))) {
      analysis.responseEffectiveness.phoneNumbers++;
    }
  });
  // Calculate averages and retention
  analysis.conversationFlow.averageLength = totalMessages / analysis.totalConversations;
  
  userSessions.forEach((session, psid) => {
    analysis.userRetention[session.conversations] = 
      (analysis.userRetention[session.conversations] || 0) + 1;
  });
  // Generate report
  const report = {
    ...analysis,
    summary: {
      totalUsers: userSessions.size,
      avgMessagesPerConversation: analysis.conversationFlow.averageLength,
      peakHours: analysis.timeAnalysis.hourly
        .map((count, hour) => ({hour, count}))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3),
      mostPopularServices: Object.entries(analysis.servicePopularity)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      conversionRate: (analysis.responseEffectiveness.phoneNumbers / 
        analysis.totalConversations * 100).toFixed(2) + '%'
    }
  };
  // Save report
  const reportPath = path.join(logsDir, `analysis_${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  return report;
}

module.exports = analyzeConversations;