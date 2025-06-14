'use client';

import { FaRocket, FaExchangeAlt, FaUsers, FaShieldAlt, FaChartLine, FaGamepad } from 'react-icons/fa';

const roadmapItems = [
  {
    phase: 'Phase 1: Foundation',
    status: 'completed',
    items: [
      {
        title: 'Token Launch',
        description: 'Successful launch of BULL token on Solana',
        icon: FaRocket,
        completed: true
      },
      {
        title: 'Community Building',
        description: 'Establish initial community and social presence',
        icon: FaUsers,
        completed: true
      },
      {
        title: 'Basic Token Utility',
        description: 'Implement core token functionality and distribution',
        icon: FaExchangeAlt,
        completed: true
      }
    ]
  },
  {
    phase: 'Phase 2: Growth',
    status: 'current',
    items: [
      {
        title: 'Staking Platform',
        description: 'Launch staking mechanism with attractive APY',
        icon: FaChartLine,
        completed: false
      },
      {
        title: 'Security Audits',
        description: 'Complete comprehensive security audits',
        icon: FaShieldAlt,
        completed: false
      },
      {
        title: 'Partnership Program',
        description: 'Establish strategic partnerships in the Solana ecosystem',
        icon: FaUsers,
        completed: false
      }
    ]
  },
  {
    phase: 'Phase 3: Expansion',
    status: 'upcoming',
    items: [
      {
        title: 'NFT Collection',
        description: 'Launch exclusive BULL NFT collection',
        icon: FaGamepad,
        completed: false
      },
      {
        title: 'Governance Platform',
        description: 'Implement DAO governance for community decisions',
        icon: FaUsers,
        completed: false
      },
      {
        title: 'Cross-chain Integration',
        description: 'Expand to additional blockchain networks',
        icon: FaExchangeAlt,
        completed: false
      }
    ]
  }
];

export default function Roadmap() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-gold text-center mb-12">Roadmap</h2>
        
        <div className="space-y-12">
          {roadmapItems.map((phase, phaseIndex) => (
            <div key={phase.phase} className="relative">
              {/* Phase Title */}
              <div className="flex items-center mb-8">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  phase.status === 'completed' ? 'bg-green-500/20' :
                  phase.status === 'current' ? 'bg-gold/20' :
                  'bg-dark-red/50'
                }`}>
                  <span className={`text-xl font-bold ${
                    phase.status === 'completed' ? 'text-green-500' :
                    phase.status === 'current' ? 'text-gold' :
                    'text-warm-gray'
                  }`}>
                    {phaseIndex + 1}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-light-gold ml-4">{phase.phase}</h3>
              </div>

              {/* Timeline Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {phase.items.map((item, itemIndex) => (
                  <div 
                    key={item.title}
                    className={`bg-dark-red/30 p-6 rounded-lg border ${
                      item.completed ? 'border-green-500/50' : 'border-gold/50'
                    } transition-all duration-300 hover:bg-dark-red/40`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${
                        item.completed ? 'bg-green-500/20' : 'bg-gold/20'
                      }`}>
                        <item.icon className={`text-2xl ${
                          item.completed ? 'text-green-500' : 'text-gold'
                        }`} />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-light-gold mb-2">{item.title}</h4>
                        <p className="text-sm text-warm-gray">{item.description}</p>
                        {item.completed && (
                          <span className="inline-block mt-2 text-xs text-green-500">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 