import React, { useState, useEffect, useMemo } from 'react';

interface Click {
  id: number;
  x: number;
  y: number;
  amount: number;
}

interface OverlayContent {
  title: string;
  url: string;
  reward: number;
  task?: string;
}

type OverlayType = 'boost' | 'task' | 'daily' | 'booster' | 'miner' | null;

interface DailyRewardContent {
  type: 'daily';
  currentDay: number;
  reward: number;
}

interface BoosterOverlayContent {
  name: string;
  cost: number;
  description: string;
  key: string;
}

interface MinerOverlayContent {
  title: string;
  description: string;
  cost: number;
  profitPerHour: number;
  image: string;
}

interface MiningItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  profitPerHour: number;
  image: string;
  levelRequired: string;
}

// Lock SVG Icon Component
const LockIcon = ({ className }: { className: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-9a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V10a2 2 0 012-2h1V6a5 5 0 0110 0v2h1zm-6-5a3 3 0 00-3 3v2h6V6a3 3 0 00-3-3z" />
  </svg>
);

export default function Game() {
  const [activeTab, setActiveTab] = useState('tap');
  const [coins, setCoins] = useState(0);
  const [energy, setEnergy] = useState(1000);
  const [earnPerTap, setEarnPerTap] = useState(2);
  const [profitPerHour, setProfitPerHour] = useState(100);
  const [level, setLevel] = useState(1);
  const [clicks, setClicks] = useState<Click[]>([]);
  const [purchasedBoosters, setPurchasedBoosters] = useState<Record<string, boolean>>({});
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [dailyProgress, setDailyProgress] = useState(1);
  const [overlayType, setOverlayType] = useState<OverlayType>(null);
  const [overlayContent, setOverlayContent] = useState<OverlayContent | DailyRewardContent | null>(null);
  const [boostCooldown, setBoostCooldown] = useState<number | null>(null);
  const [lastClaimDate, setLastClaimDate] = useState<string | null>(null);
  const [energyCharges, setEnergyCharges] = useState(6);
  const [lastChargeClaim, setLastChargeClaim] = useState<number | null>(null);
  const [boosterContent, setBoosterContent] = useState<BoosterOverlayContent | null>(null);
  const [isTaskLoading, setIsTaskLoading] = useState(false);
  const [minerContent, setMinerContent] = useState<MinerOverlayContent | null>(null);

  const LEVEL_THRESHOLDS = useMemo(() => ({
    1: 1000,        // Beginner
    2: 5000,        // Novice
    3: 20000,       // Intermediate
    4: 50000,       // Advanced
    5: 100000,      // Expert
    6: 200000,      // Master
    7: 500000,      // Elite
    8: 1000000,     // Champion
    9: 2000000,     // Legend
    10: 5000000     // Supreme
  } as Record<number, number>), []);

  interface Booster {
    name: string;
    cost: number;
    multiplier?: number;
    bonus?: number;
  }

  const BOOSTERS: Record<string, Booster> = {
    multitap: { name: 'MultiTap', cost: 1000, multiplier: 2 },
    energyLimit: { name: 'Energy+', cost: 2000, bonus: 5 }
  };

  const MINING_ITEMS: MiningItem[] = [
    {
      id: 'genome-accelerator',
      title: 'Genome Accelerator Pass',
      description: 'Unleash the speed of evolution! This pass upgrades your DNA replication to warp speed, doubling your mining rewards in no time.',
      cost: 992,
      profitPerHour: 300,
      image: '/mine1.webp',
      levelRequired: '1'
    },
    {
      id: 'double-helix',
      title: 'Double Helix Turbocharger',
      description: 'Twist your way to victory! Amplify your mining speed by energizing your DNA strands with this turbo boost.',
      cost: 2500,
      profitPerHour: 800,
      image: '/mine2.webp',
      levelRequired: '2'
    },
    {
      id: 'elite-biolab',
      title: 'Elite BioLab Pass',
      description: 'Welcome to the lab of legends! Only the finest DNA sequences get mined here, with rewards flowing faster than ever.',
      cost: 5000,
      profitPerHour: 1500,
      image: '/mine3.webp',
      levelRequired: '3'
    },
    {
      id: 'mutation-surge',
      title: 'Mutation Surge',
      description: 'Sometimes evolution gets a lucky break—activate a Mutation Surge to supercharge your mining and discover rare bonuses!',
      cost: 10000,
      profitPerHour: 3000,
      image: '/mine4.webp',
      levelRequired: '4'
    },
    {
      id: 'genome-builder',
      title: 'Genome Builder Boost',
      description: 'Stack those nucleotides like a pro! Build longer DNA strands and watch your rewards multiply.',
      cost: 20000,
      profitPerHour: 6000,
      image: '/mine5.webp',
      levelRequired: '5'
    },
    {
      id: 'epigenetic-power',
      title: 'Epigenetic Power-Up',
      description: 'Unlock the hidden potential in your genes—boost your mining rate by flipping the right molecular switches!',
      cost: 50000,
      profitPerHour: 12000,
      image: '/mine6.webp',
      levelRequired: '6'
    },
    {
      id: 'replication-accelerator',
      title: 'Replication Accelerator',
      description: 'Replicate faster than nature intended! Outpace your peers with lightning-fast DNA copying.',
      cost: 100000,
      profitPerHour: 25000,
      image: '/mine7.webp',
      levelRequired: '7'
    },
    {
      id: 'legendary-extractor',
      title: 'Legendary Gene Extractor',
      description: 'Only the rarest DNA sequences make history. Discover one, and watch your mining speed skyrocket!',
      cost: 200000,
      profitPerHour: 50000,
      image: '/mine8.webp',
      levelRequired: '8'
    },
    {
      id: 'genome-mapping',
      title: 'Genome Mapping License',
      description: 'Chart the uncharted! Explore hidden DNA regions for massive boosts and secret rewards.',
      cost: 500000,
      profitPerHour: 100000,
      image: '/mine9.webp',
      levelRequired: '9'
    },
    {
      id: 'evolutionary-leap',
      title: 'Evolutionary Leap Token',
      description: 'Jump up the evolutionary ladder—from single-cell to apex miner in record time!',
      cost: 1000000,
      profitPerHour: 200000,
      image: '/mine10.webp',
      levelRequired: '10'
    }
  ];

  const getLevelName = (level: number) => {
    const names = {
      1: 'Beginner',
      2: 'Novice',
      3: 'Intermediate',
      4: 'Advanced',
      5: 'Expert',
      6: 'Master',
      7: 'Elite',
      8: 'Champion',
      9: 'Legend',
      10: 'Supreme'
    };
    return names[level as keyof typeof names] || 'Supreme';
  };

  const handleClick = (event: React.MouseEvent) => {
    if (energy <= 0) return;
    
    const clickId = Date.now();
    const energyCost = earnPerTap;
    
    if (energy >= energyCost) {
      setCoins(prev => Math.floor(prev + earnPerTap));
      setEnergy(prev => prev - energyCost);

      // Get the center position of the DNA circle
      const rect = event.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      setClicks(prev => [...prev, {
        id: clickId,
        x: centerX,
        y: centerY,
        amount: earnPerTap
      }]);
    }
  };

  const handleTaskClick = (taskType: 'telegram' | 'twitter') => {
    if (taskType === 'telegram') {
      setOverlayType('task');
      setOverlayContent({
        title: 'Join Telegram',
        url: 'https://t.me/shaomun',
        reward: 5000,
        task: 'telegram'
      });
    } else if (taskType === 'twitter') {
      setOverlayType('task');
      setOverlayContent({
        title: 'Follow Twitter',
        url: 'https://x.com/mun336699',
        reward: 5000,
        task: 'twitter'
      });
    }
  };

  const handleDailyReward = () => {
    setOverlayType('daily');
    setOverlayContent({
      type: 'daily',
      currentDay: dailyProgress,
      reward: 1000 * dailyProgress
    });
  };

  const handleTaskCompletion = (task: string) => {
    setIsTaskLoading(true);
    window.open(overlayContent?.url, '_blank');
    
    setTimeout(() => {
      setCompletedTasks(prev => ({ ...prev, [task]: true }));
      setCoins(prev => Math.floor(prev + (overlayContent?.reward || 0)));
      setIsTaskLoading(false);
      setOverlayType(null);
    }, 6000);
  };

  const canClaimDaily = () => {
    if (!lastClaimDate) return true;
    const lastDate = new Date(lastClaimDate);
    const now = new Date();
    return lastDate.getDate() !== now.getDate();
  };

  const handleBoosterClick = (key: string, booster: typeof BOOSTERS[keyof typeof BOOSTERS]) => {
    setOverlayType('booster');
    setBoosterContent({
      name: booster.name,
      cost: booster.cost,
      description: key === 'multitap' ? `${booster.multiplier}x per tap` : `+${booster.bonus} energy`,
      key
    });
  };

  const handleEnergyBoostClick = () => {
    setOverlayType('booster');
    setBoosterContent({
      name: 'Full Energy',
      cost: 0,
      description: 'Recharge your energy to the maximum and do another round of mining',
      key: 'energyBoost'
    });
  };

  const handleMinerClick = (miner: MiningItem) => {
    setOverlayType('miner');
    setMinerContent({
      title: miner.title,
      description: miner.description,
      cost: miner.cost,
      profitPerHour: miner.profitPerHour,
      image: miner.image
    });
  };

  const renderTapTab = () => (
    <div className="flex-grow flex flex-col">
      {/* Top Stats Section */}
      <div className="px-4 pt-4">
        {/* Profile Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#272a2f]"></div>
            <div>
              <p className="text-sm text-[#85827d]">Player</p>
              <p className="font-bold">Anonymous</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-[#272a2f] px-3 py-1 rounded-full">
              <span className="text-[#f3ba2f]">DLX</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="bg-[#272a2f] p-3 rounded-lg text-center">
            <p className="text-xs text-[#85827d]">Earn/Tap</p>
            <div className="flex items-center justify-center gap-1">
              <img src="/coin.png" alt="Coin" className="w-5 h-5" />
              <p className="text-sm font-bold">{earnPerTap}</p>
            </div>
          </div>
          <div className="bg-[#272a2f] p-3 rounded-lg text-center">
            <p className="text-xs text-[#85827d]">Next Level</p>
            <p className="text-sm font-bold">{LEVEL_THRESHOLDS[level]?.toLocaleString()}</p>
          </div>
          <div className="bg-[#272a2f] p-3 rounded-lg text-center">
            <p className="text-xs text-[#85827d]">Profit/Hour</p>
            <div className="flex items-center justify-center gap-1">
              <img src="/coin.png" alt="Coin" className="w-5 h-5" />
              <p className="text-sm font-bold">{profitPerHour}</p>
            </div>
          </div>
        </div>

        {/* Balance Display */}
        <div className="text-center mb-3">
          <div className="flex items-center justify-center gap-2">
            <img src="/coin.png" alt="Coin" className="w-16 h-16" />
            <p className="text-4xl font-bold text-[#f3ba2f]">
              {coins.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Level Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <p>Level {level} : {getLevelName(level)}</p>
            <p>{coins.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / {LEVEL_THRESHOLDS[level]?.toLocaleString()}</p>
          </div>
          <div className="h-3 bg-[#272a2f] rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-[#560f77] via-[#9b2e9b] to-[#ff69b4] rounded-full transition-all duration-300"
              style={{ width: `${Math.min((coins / LEVEL_THRESHOLDS[level]) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Character Section */}
      <div className="mt-9 flex flex-col items-center justify-center relative">
        <div 
          className="w-[280px] h-[280px] rounded-full bg-[#15171a] flex items-center justify-center cursor-pointer"
          onClick={handleClick}
        >
          <div className="w-[280px] h-[280px] rounded-full bg-[#15171a] flex items-center justify-center">
            <img 
              src="/DNA.png" 
              alt="DNA"
              className="w-[320px] h-[320px] object-contain transition-transform duration-200 active:animate-[click-pulse_200ms_ease-in-out]"
            />
          </div>
        </div>

        {/* Floating points animation */}
        {clicks.map((click) => (
          <div
            key={click.id}
            className="absolute text-4xl font-bold text-[#f3ba2f] pointer-events-none"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              animation: 'float 0.4s ease-out forwards'
            }}
          >
            +{earnPerTap}
          </div>
        ))}

        {/* Energy and Boost Button Row */}
        <div className="mb-6 flex items-center justify-between w-full px-9">
          {/* Energy Section - Left aligned */}
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center">
              <img src="/energy.png" alt="Energy" className="w-8 h-9" />
            </div>
            <p className="text-base">
              {energy}/{1000 + (purchasedBoosters.energyLimit ? 5 : 0)}
            </p>
          </div>

          {/* Boost Button - Right aligned */}
          <button 
            onClick={() => {
              setOverlayType('boost');
            }}
            className="flex items-center py-3 text-white rounded-xl font-semibold"
          >
            <img src="/boost.png" alt="Boost" className="w-11 h-9" />
            Boost
          </button>
        </div>
      </div>
    </div>
  );

  const renderEarnTab = () => (
    <div className="p-4 space-y-6">
      {/* Header with Coin */}
      <div className="flex flex-col items-center mb-9">
        <div className="relative w-[118px] h-[118px] mb-12 mt-3">
          {/* Outer glow layers with adjusted spread */}
          <div className="absolute inset-[-75%] bg-[#f3ba2f]/5 rounded-full blur-3xl"></div>
          <div className="absolute inset-[-50%] bg-[#f3ba2f]/10 rounded-full blur-2xl"></div>
          <div className="absolute inset-[-35%] bg-[#f3ba2f]/15 rounded-full blur-xl"></div>
          
          {/* Inner glow layers */}
          <div className="absolute inset-[-20%] bg-[#f3ba2f]/20 rounded-full blur-xl"></div>
          <div className="absolute inset-0 bg-[#f3ba2f]/30 rounded-full blur-lg"></div>
          
          {/* Coin image - removed animation */}
          <img 
            src="/coin.png" 
            alt="Coin" 
            className="w-full h-full relative z-10"
          />
        </div>
        <h2 className="text-[36px] font-bold text-center">Earn more coins</h2>
      </div>

      {/* Daily Tasks Section */}
      <div>
        <h3 className="text-sm font-semibold text-[#ffffff] mb-2">Daily tasks</h3>
        <div className="bg-[#272a2f] p-4 rounded-lg flex items-center justify-between cursor-pointer"
          onClick={handleDailyReward}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <img src="/calendar.png" alt="Daily" className="w-12 h-11" />
            </div>
            <div>
              <span className="block">Daily reward</span>
              <div className="flex items-center mt-1">
                <img src="/coin.png" alt="Coin" className="w-4 h-4 mr-1" />
                <span className="text-[#f3ba2f]">+511,500</span>
              </div>
            </div>
          </div>
          <div className="text-[#85827d]">›</div>
        </div>
      </div>

      {/* Tasks List Section */}
      <div>
        <h3 className="text-sm font-semibold text-[#ffffff] mb-2">Tasks list</h3>
        <div className="space-y-2">
          <div 
            className="bg-[#272a2f] p-4 rounded-lg flex items-center justify-between cursor-pointer"
          onClick={() => handleTaskClick('telegram')}
        >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1d2025] rounded-lg flex items-center justify-center">
                <img src="/telegram.png" alt="Telegram" className="w-10 h-10" />
              </div>
              <div>
                <span className="block">Join our TG channel</span>
                <div className="flex items-center mt-1">
                  <img src="/coin.png" alt="Coin" className="w-4 h-4 mr-1" />
                  <span className="text-[#f3ba2f]">+5,000</span>
                </div>
              </div>
            </div>
            <div className={completedTasks['telegram'] ? "text-[#4caf50]" : "text-[#85827d]"}>
              {completedTasks['telegram'] ? "✓" : "›"}
            </div>
          </div>

          <div 
            className="bg-[#272a2f] p-4 rounded-lg flex items-center justify-between cursor-pointer"
          onClick={() => handleTaskClick('twitter')}
        >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1d2025] rounded-lg flex items-center justify-center">
                <img src="/twitter.png" alt="X" className="w-9 h-9" />
              </div>
              <div>
                <span className="block">Follow our X account</span>
                <div className="flex items-center mt-1">
                  <img src="/coin.png" alt="Coin" className="w-4 h-4 mr-1" />
                  <span className="text-[#f3ba2f]">+5,000</span>
                </div>
              </div>
            </div>
            <div className={completedTasks['twitter'] ? "text-[#4caf50]" : "text-[#85827d]"}>
              {completedTasks['twitter'] ? "✓" : "›"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMineTab = () => (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-4">
        {MINING_ITEMS.map((miner) => {
          const isLocked = level < parseInt(miner.levelRequired);
          
          return (
            <div 
              key={miner.id}
              className={`bg-[#272a2f] p-4 rounded-lg ${!isLocked ? 'cursor-pointer' : 'opacity-70'}`}
              onClick={() => !isLocked && handleMinerClick(miner)}
            >
              <div className="flex justify-between mb-4">
                {/* Upper Left - Image */}
                <div className="w-12 h-12 bg-[#1d2025] rounded-lg flex items-center justify-center relative">
                  <img src={miner.image} alt={miner.title} className="w-8 h-8" />
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <LockIcon className="w-5 h-5 text-white/80" />
                    </div>
                  )}
                </div>

                {/* Upper Right - Title and Profit */}
                <div className="text-right">
                  <h3 className="font-bold mb-1">{miner.title}</h3>
                  <p className="text-[#85827d] text-sm mb-1">Profit per hour</p>
                  <div className="flex items-center gap-1 justify-end">
                    <img src="/coin.png" alt="Coin" className="w-4 h-4" />
                    <span className="text-[#f3ba2f]">+{miner.profitPerHour}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end">
                {/* Lower Left - Level Required */}
                <div className="text-sm text-[#85827d] flex items-center gap-1">
                  Level {miner.levelRequired}
                  {isLocked && <LockIcon className="w-4 h-4 text-[#85827d]" />}
                </div>

                {/* Lower Right - Cost */}
                <div className="flex items-center gap-1">
                  <img src="/coin.png" alt="Coin" className="w-4 h-4" />
                  <span className={`font-bold ${isLocked ? 'text-[#85827d]' : 'text-[#f3ba2f]'}`}>
                    {miner.cost}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAirdropTab = () => (
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 flex flex-col items-center">
        {/* Glowing Hamster Icon */}
        <div className="relative w-[210px] h-[210px] mb-8">
          <div className="absolute inset-0 bg-[#f3ba2f]/20 rounded-full blur-xl"></div>
          <div className="relative w-[210px] h-[210px] rounded-full flex items-center justify-center">
            <img 
              src="/DNA.png" 
              alt="DNA"
              className="w-[210px] h-[210px] object-contain"
            />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold mb-12 text-center leading-relaxed">
          <span className="text-[#f3ba2f]">Get ready!</span>
          <br />
          <span className="text-[#f3ba2f]">Airdrop is coming soon!</span>
        </h2>

        {/* Status List */}
        <div className="w-full space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-[#4caf50] rounded-full"></div>
            <span className="text-[#85827d] text-lg">Listing on Raydium, Jupiter, Orca</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-[#4caf50] rounded-full"></div>
            <span className="text-[#85827d] text-lg">Exclusive Airdrop for Early Players</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-[#4caf50] rounded-full"></div>
            <span className="text-[#85827d] text-lg">Special NFT Rewards</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-[#4caf50] rounded-full"></div>
            <span className="text-[#85827d] text-lg">Token Launch Benefits</span>
          </div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse-slow {
        0%, 100% { opacity: 0.2; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.4); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 0.9; transform: scale(1.3); }
      }
      @keyframes pulse-fast {
        0%, 100% { opacity: 0.4; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
      }
      @keyframes coin-spin {
        0% { transform: rotateY(0deg) scale(1); }
        50% { transform: rotateY(180deg) scale(1.1); }
        100% { transform: rotateY(360deg) scale(1); }
      }
      .animate-pulse-slow {
        animation: pulse-slow 4s ease-in-out infinite;
      }
      .animate-pulse {
        animation: pulse 3s ease-in-out infinite;
      }
      .animate-pulse-fast {
        animation: pulse-fast 2s ease-in-out infinite;
      }
      .animate-coin-spin {
        animation: coin-spin 4s ease-in-out infinite;
        transform-style: preserve-3d;
      }
      @keyframes pulse-border {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
      .animate-pulse-border {
        animation: pulse-border 2s ease-in-out infinite;
      }
      @keyframes float {
        0% { 
          opacity: 1;
          transform: translateY(0);
        }
        50% {
          opacity: 1;
        }
        100% { 
          opacity: 0;
          transform: translateY(-20px);
        }
      }
      @keyframes click-pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  useEffect(() => {
    const currentThreshold = LEVEL_THRESHOLDS[level];
    if (currentThreshold && coins >= currentThreshold) {
      setLevel(prev => prev + 1);
    }
  }, [coins, level, LEVEL_THRESHOLDS]);

  useEffect(() => {
    let lastUpdate = Date.now();
    
    const interval = setInterval(() => {
      const now = Date.now();
      const timeDiff = now - lastUpdate;
      const hourlyFraction = timeDiff / (60 * 60 * 1000); // Convert milliseconds to hours
      
      setCoins(prev => prev + (profitPerHour * hourlyFraction));
      lastUpdate = now;
    }, 100); // Update more frequently for smoother animation
    
    return () => clearInterval(interval);
  }, [profitPerHour]);

  useEffect(() => {
    if (!boostCooldown) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      if (now >= boostCooldown) {
        setBoostCooldown(null);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [boostCooldown]);

  useEffect(() => {
    // Clear clicks when switching tabs
    setClicks([]);
  }, [activeTab]);

  const TAB_ICONS = {
    tap: (active: boolean) => (
      <img 
        src="/tap.png" 
        alt="tap" 
        className={`w-9 h-9 mx-auto ${active ? 'opacity-100' : 'opacity-30'}`}
      />
    ),
    mine: (active: boolean) => (
      <img 
        src="/mine.png" 
        alt="mine" 
        className={`w-6 h-6 mx-auto ${active ? 'opacity-100' : 'opacity-30'}`}
      />
    ),
    friends: (active: boolean) => (
      <img 
        src="/friends.png" 
        alt="friends" 
        className={`w-6 h-6 mx-auto ${active ? 'opacity-100' : 'opacity-30'}`}
      />
    ),
    earn: (active: boolean) => (
      <img 
        src="/earn.png" 
        alt="earn" 
        className={`w-6 h-6 mx-auto ${active ? 'opacity-100' : 'opacity-30'}`}
      />
    ),
    airdrop: (active: boolean) => (
      <div className="w-9 h-9 mx-auto overflow-hidden">
        <img 
          src="/DNA.png" 
          alt="airdrop" 
          className={`w-9 h-9 object-cover scale-150 ${active ? 'opacity-100' : 'opacity-30'}`}
        />
      </div>
    )
  };

  const getDailyReward = (day: number) => {
    const cycleDay = ((day - 1) % 10) + 1;
    return 500 * Math.pow(2, cycleDay - 1);
  };

  return (
    <div className="bg-black min-h-screen flex justify-center">
      <div className="w-full max-w-xl bg-[#15171a] text-white flex flex-col relative">
        {activeTab === 'tap' && renderTapTab()}
        {activeTab === 'mine' && renderMineTab()}
        {activeTab === 'earn' && renderEarnTab()}
        {activeTab === 'airdrop' && renderAirdropTab()}
        
        {/* Friends Tab with Fixed Bottom Buttons */}
        {activeTab === 'friends' && (
          <div className="flex flex-col h-full">
            <div className="p-4 space-y-6 flex-1 overflow-auto pb-24">
              {/* Header */}
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Invite friends!</h2>
                <p className="text-[#85827d]">You and your friend will receive bonuses</p>
              </div>

              {/* Invite Option */}
              <div className="bg-[#272a2f] p-4 rounded-lg flex items-center gap-4">
                <div className="rounded-lg flex items-center justify-center">
                  <img src="/gift.png" alt="Gift" className="w-12 h-9" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">Invite a friend</p>
                  <div className="flex items-center gap-1 mt-1">
                    <img src="/coin.png" alt="Coin" className="w-5 h-5" />
                    <span className="text-[#f3ba2f]">+5,000</span>
                    <span className="text-[#85827d]">for you and your friend</span>
                  </div>
                </div>
              </div>

              {/* Level Bonus Table */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Bonus for leveling up</h3>
                <div className="space-y-2">
                  {/* Table Header */}
                  <div className="grid grid-cols-2 items-center px-3 mb-1">
                    <span className="text-sm text-[#85827d]">Level</span>
                    <span className="text-sm text-[#85827d] text-right">For friend</span>
                  </div>

                  {/* Novice */}
                  <div className="bg-[#272a2f] p-3 rounded-lg grid grid-cols-2 items-center">
                    <div className="flex items-center gap-2">
                      <img src="/novice.png" alt="Novice" className="w-8 h-8" />
                      <span className="text-white">Novice</span>
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <img src="/coin.png" alt="Coin" className="w-4 h-4" />
                      <span className="text-[#f3ba2f]">+10,000</span>
                    </div>
                  </div>

                  {/* Intermediate */}
                  <div className="bg-[#272a2f] p-3 rounded-lg grid grid-cols-2 items-center">
                    <div className="flex items-center gap-2">
                      <img src="/intermediate.png" alt="Intermediate" className="w-8 h-8" />
                      <span className="text-white">Intermediate</span>
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <img src="/coin.png" alt="Coin" className="w-4 h-4" />
                      <span className="text-[#f3ba2f]">+20,000</span>
                    </div>
                  </div>

                  {/* Advanced */}
                  <div className="bg-[#272a2f] p-3 rounded-lg grid grid-cols-2 items-center">
                    <div className="flex items-center gap-2">
                      <img src="/advanced.png" alt="Advanced" className="w-8 h-8" />
                      <span className="text-white">Advanced</span>
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <img src="/coin.png" alt="Coin" className="w-4 h-4" />
                      <span className="text-[#f3ba2f]">+30,000</span>
                    </div>
                  </div>

                  {/* Expert */}
                  <div className="bg-[#272a2f] p-3 rounded-lg grid grid-cols-2 items-center">
                    <div className="flex items-center gap-2">
                      <img src="/expert.png" alt="Expert" className="w-8 h-8" />
                      <span className="text-white">Expert</span>
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <img src="/coin.png" alt="Coin" className="w-4 h-4" />
                      <span className="text-[#f3ba2f]">+40,000</span>
                    </div>
                  </div>

                  {/* Master */}
                  <div className="bg-[#272a2f] p-3 rounded-lg grid grid-cols-2 items-center">
                    <div className="flex items-center gap-2">
                      <img src="/master.png" alt="Master" className="w-8 h-8" />
                      <span className="text-white">Master</span>
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <img src="/coin.png" alt="Coin" className="w-4 h-4" />
                      <span className="text-[#f3ba2f]">+50,000</span>
                    </div>
                  </div>

                  {/* Elite */}
                  <div className="bg-[#272a2f] p-3 rounded-lg grid grid-cols-2 items-center">
                    <div className="flex items-center gap-2">
                      <img src="/elite.png" alt="Elite" className="w-8 h-8" />
                      <span className="text-white">Elite</span>
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <img src="/coin.png" alt="Coin" className="w-4 h-4" />
                      <span className="text-[#f3ba2f]">+60,000</span>
                    </div>
                  </div>

                  {/* Champion */}
                  <div className="bg-[#272a2f] p-3 rounded-lg grid grid-cols-2 items-center">
                    <div className="flex items-center gap-2">
                      <img src="/champion.png" alt="Champion" className="w-8 h-8" />
                      <span className="text-white">Champion</span>
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <img src="/coin.png" alt="Coin" className="w-4 h-4" />
                      <span className="text-[#f3ba2f]">+80,000</span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="bg-[#272a2f] p-3 rounded-lg grid grid-cols-2 items-center">
                    <div className="flex items-center gap-2">
                      <img src="/legend.png" alt="Legend" className="w-8 h-8" />
                      <span className="text-white">Legend</span>
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <img src="/coin.png" alt="Coin" className="w-4 h-4" />
                      <span className="text-[#f3ba2f]">+100,000</span>
                    </div>
                  </div>

                  {/* Supreme */}
                  <div className="bg-[#272a2f] p-3 rounded-lg grid grid-cols-2 items-center">
                    <div className="flex items-center gap-2">
                      <img src="/supreme.png" alt="Supreme" className="w-8 h-8" />
                      <span className="text-white">Supreme</span>
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <img src="/coin.png" alt="Coin" className="w-4 h-4" />
                      <span className="text-[#f3ba2f]">+150,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Bottom Buttons */}
            <div className="fixed bottom-[63px] left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-xl flex gap-3 p-4">
              <button className="flex-1 bg-[#4c6fff] text-white py-3 rounded-lg font-medium">
                Invite a friend
              </button>
              <button className="w-12 h-12 bg-[#4c6fff] rounded-lg flex items-center justify-center">
                <svg 
                  className="w-5 h-5 text-[#ffffff]" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-xl bg-[#272a2f] flex justify-around items-center z-50 rounded-3xl text-xs">
          {['tap', 'mine', 'friends', 'earn', 'airdrop'].map(tab => (
            <div
              key={tab}
              className={`text-center w-1/5 p-1 cursor-pointer`}
              onClick={() => setActiveTab(tab)}
            >
              {TAB_ICONS[tab](activeTab === tab)}
              <p className={`mt-1 capitalize ${activeTab === tab ? 'text-[#ffffff] opacity-100' : 'text-[#85827d] opacity-30'}`}>
                {tab}
              </p>
            </div>
          ))}
        </div>

        {/* Add padding at the bottom of the main container */}
        <div className="pb-24"></div>

        {/* Overlay */}
        {overlayType && (
          <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50">
            {/* Main overlay content */}
            <div className="w-full max-w-xl bg-[#1d2025] rounded-t-3xl overflow-visible relative z-10">              
              <div className="p-4 max-h-[80vh] overflow-y-auto [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar-track]:bg-[#1d2025] [&::-webkit-scrollbar-thumb]:bg-[#272a2f] [&::-webkit-scrollbar-thumb]:rounded-full">
                {overlayType === 'daily' ? (
                  <div className="w-full max-w-xl mx-auto">
                    {/* Header with Calendar Icon - Adjusted spacing */}
                    <div className="flex flex-col items-center pt-4 relative">
                      <button 
                        onClick={() => setOverlayType(null)}
                        className="absolute right-4 top-0 w-8 h-8 rounded-full bg-[#272a2f] flex items-center justify-center"
                      >
                        ✕
                      </button>

                      {/* Calendar Icon - Adjusted margin */}
                      <div className="mb-4">
                        <img 
                          src="/calendar.png" 
                          alt="Calendar" 
                          className="w-[120px] h-[120px]"
                        />
                      </div>

                      {/* Title and Subtitle */}
                      <h3 className="text-2xl font-bold mb-2">Daily Reward</h3>
                      <p className="text-sm text-[#85827d] text-center mb-8">
                        Accrue coins for logging into the game daily without skipping
                      </p>
                    </div>

                    {/* Days Grid */}
                    <div className="mb-6">
                      <div className="grid grid-cols-5 gap-2">
                        {Array.from({ length: 10 }, (_, i) => (
                          <div
                            key={i}
                            className={`aspect-square rounded-lg flex flex-col items-center justify-between p-2 ${
                              i + 1 === (dailyProgress - 1) % 10 + 1 && canClaimDaily() 
                                ? 'bg-gradient-to-br from-[#4caf50] via-[#45a049] to-[#2d8a32] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]' 
                                : i + 1 < (dailyProgress - 1) % 10 + 1
                                ? 'bg-[#8fe592]/30' 
                                : 'bg-[#272a2f]'
                            }`}
                          >
                            <span className="text-sm font-bold">Day {i + 1}</span>
                            <img src="/coin.png" alt="Coin" className="w-8 h-8" />
                            <span className="text-xs">{(500 * Math.pow(2, i)).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Claim Button */}
                    <button
                      className={`w-full py-3 rounded-lg font-bold ${
                        canClaimDaily() ? 'bg-[#f3ba2f] text-black' : 'bg-[#43433b] text-[#85827d]'
                      }`}
                      onClick={() => {
                        if (canClaimDaily()) {
                          const reward = getDailyReward(dailyProgress);
                          setCoins(prev => Math.floor(prev + reward));
                          setDailyProgress(prev => prev + 1);
                          setLastClaimDate(new Date().toISOString());
                        }
                      }}
                      disabled={!canClaimDaily()}
                    >
                      {canClaimDaily() 
                        ? `Claim ${getDailyReward(dailyProgress).toLocaleString()} coins` 
                        : 'Come back tomorrow'}
                    </button>
                  </div>
                ) : overlayType === 'task' ? (
                  <div className="flex flex-col items-center pt-8 relative">
                    {/* Close Button - Top right corner */}
                    <button 
                      onClick={() => setOverlayType(null)}
                      className="absolute right-4 top-0 w-8 h-8 rounded-full bg-[#272a2f] flex items-center justify-center"
                    >
                      ✕
                    </button>

                    {/* Logo */}
                    <div className="mb-6">
                      {overlayContent?.title === 'Follow Twitter' ? (
                        <img 
                          src="/twitter.png" 
                          alt="X Logo" 
                          style={{ width: '120px', height: '120px' }}
                        />
                      ) : (
                        <img 
                          src="/telegram.png" 
                          alt="Telegram Logo" 
                          style={{ width: '120px', height: '120px' }}
                        />
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold mb-6">
                      {overlayContent?.title === 'Follow Twitter' ? 'Follow our X account' : 'Join our TG Channel'}
                    </h3>

                    {/* Button */}
                  <button
                      onClick={() => handleTaskCompletion(overlayContent?.task)}
                      disabled={isTaskLoading}
                      className={`w-full bg-[#4c6fff] text-white py-3 rounded-lg font-medium mb-3 ${
                        isTaskLoading ? 'opacity-50' : ''
                      }`}
                  >
                    {isTaskLoading ? (
                      'Verifying...'
                    ) : overlayContent?.title === 'Follow Twitter' ? (
                      'Follow'
                    ) : (
                      'Join'
                    )}
                  </button>
                    
                    {/* Reward */}
                    <div className="flex items-center gap-2 mb-8">
                      <img src="/coin.png" alt="Coin" className="w-6 h-6" />
                      <span className="text-xl text-[#f3ba2f]">+{overlayContent?.reward.toLocaleString()}</span>
                    </div>
                  </div>
                ) : overlayType === 'boost' ? (
                  <div className="w-full max-w-xl mx-auto">
                    {/* Close Button */}
                    <div className="flex justify-end mb-6">
                      <button 
                        onClick={() => setOverlayType(null)}
                        className="w-8 h-8 rounded-full bg-[#272a2f] flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Free Daily Boosters */}
                    <div className="mb-6">
                      <h3 className="text-sm text-[#85827d] mb-3">Free daily boosters</h3>
                      <div className="space-y-2">
                        <div 
                          className={`bg-[#272a2f] p-4 rounded-lg flex items-center justify-between ${
                            !lastChargeClaim || Date.now() >= lastChargeClaim + 60 * 60 * 1000 ? 'cursor-pointer' : 'opacity-50'
                          }`}
                          onClick={() => {
                            if (!lastChargeClaim || Date.now() >= lastChargeClaim + 60 * 60 * 1000) {
                              handleEnergyBoostClick();
                            }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <img src="/energy.png" alt="Energy" className="w-6 h-6" />
                            <div>
                              <span>Full energy</span>
                              <div className="text-sm text-[#85827d] mt-1">
                                {energyCharges}/6 available
                              </div>
                            </div>
                          </div>
                          <div className="text-[#85827d]">
                            {lastChargeClaim && Date.now() < lastChargeClaim + 60 * 60 * 1000
                              ? (() => {
                                  const timeLeft = lastChargeClaim + 60 * 60 * 1000 - Date.now();
                                  const minutes = Math.floor(timeLeft / (60 * 1000));
                                  const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
                                  return `${minutes}min ${seconds.toString().padStart(2, '0')}sec`;
                                })()
                              : energyCharges > 0 
                                ? <span className="text-[#4caf50] font-bold">Ready</span> 
                                : 'No charges'
                            }
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Boosters */}
                    <div>
                      <h3 className="text-sm text-[#85827d] mb-3">Boosters</h3>
                      <div className="space-y-2">
                        {Object.entries(BOOSTERS).map(([key, booster]) => (
                          <div key={key} 
                            className="bg-[#272a2f] p-4 rounded-lg flex items-center justify-between cursor-pointer"
                            onClick={() => handleBoosterClick(key, booster)}
                          >
                            <div className="flex items-center gap-3">
                              <img 
                                src={key === 'multitap' ? '/boosttap.png' : '/energy+.png'} 
                                alt={booster.name} 
                                className="w-6 h-6"
                              />
                              <div>
                                <p>{booster.name}</p>
                                <div className="flex items-center gap-1">
                                  <img src="/coin.png" alt="Coin" className="w-4 h-4" />
                                  <span className="text-[#f3ba2f]">{booster.cost.toLocaleString()}</span>
                                  <span className="text-[#85827d]"> for {key === 'multitap' ? '7M' : '6M'}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-[#85827d]">›</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : overlayType === 'booster' ? (
                  <div className="flex flex-col items-center pt-8 relative">
                    {/* Close Button - Modified to go back to boost menu */}
                    <button 
                      onClick={() => setOverlayType('boost')}
                      className="absolute right-4 top-0 w-8 h-8 rounded-full bg-[#272a2f] flex items-center justify-center"
                    >
                      ✕
                    </button>

                    {/* Icon */}
                    <div className="mb-8">
                      <img 
                        src={boosterContent?.key === 'multitap' ? '/boosttap.png' : 
                            boosterContent?.key === 'energyBoost' ? '/energy.png' : '/energy+.png'} 
                        alt={boosterContent?.name} 
                        className="w-[160px] h-[160px]"
                      />
                    </div>

                    {/* Title */}
                    <h3 className="text-3xl font-bold mb-3">{boosterContent?.name}</h3>
                    
                    {/* Description */}
                    <p className="text-base text-[#85827d] text-center mb-8">
                      {boosterContent?.key === 'multitap' 
                        ? 'Increase the amount of coins you can earn per tap'
                        : 'Increase the limit of energy'
                      }
                    </p>

                    {/* Cost */}
                    <div className="flex items-center gap-3 mb-10">
                      <img src="/coin.png" alt="Coin" className="w-9 h-9" />
                      <span className="text-2xl text-[#f3ba2f]">{boosterContent?.cost.toLocaleString()}</span>
                    </div>

                    {/* Purchase Button */}
                    <button
                      onClick={() => {
                        if (boosterContent?.key === 'energyBoost') {
                          if (energyCharges > 0) {
                            const now = Date.now();
                            if (!lastChargeClaim || now >= lastChargeClaim + 60 * 60 * 1000) {
                              setEnergy(1000 + (purchasedBoosters.energyLimit ? 5 : 0));
                              setEnergyCharges(prev => prev - 1);
                              setLastChargeClaim(now);
                              setOverlayType(null);
                              setActiveTab('tap');  // Return to tap tab
                            }
                          }
                        } else if (coins >= boosterContent!.cost && !purchasedBoosters[boosterContent!.key]) {
                          setCoins(prev => Math.floor(prev - boosterContent!.cost));
                          setPurchasedBoosters(prev => ({ ...prev, [boosterContent!.key]: true }));
                          if (boosterContent!.key === 'multitap') {
                            setEarnPerTap(prev => prev * BOOSTERS.multitap.multiplier);
                          }
                          setOverlayType(null);
                          setActiveTab('tap');  // Return to tap tab
                        }
                      }}
                      disabled={
                        boosterContent?.key === 'energyBoost' 
                          ? energyCharges <= 0 || (lastChargeClaim && Date.now() < lastChargeClaim + 60 * 60 * 1000)
                          : !boosterContent || purchasedBoosters[boosterContent.key] || coins < boosterContent.cost
                      }
                      className={`w-full py-4 rounded-lg text-xl font-bold ${
                        boosterContent?.key === 'energyBoost'
                          ? (energyCharges > 0 && (!lastChargeClaim || Date.now() >= lastChargeClaim + 60 * 60 * 1000))
                            ? 'bg-[#f3ba2f] text-black'
                            : 'bg-[#43433b] text-[#85827d]'
                          : boosterContent && coins >= boosterContent.cost && !purchasedBoosters[boosterContent.key]
                            ? 'bg-[#f3ba2f] text-black'
                            : 'bg-[#43433b] text-[#85827d]'
                      }`}
                    >
                      Go ahead
                    </button>
                  </div>
                ) : overlayType === 'miner' ? (
                  <div className="flex flex-col items-center pt-8 relative">
                    {/* Close Button */}
                    <button 
                      onClick={() => setOverlayType(null)}
                      className="absolute right-4 top-0 w-8 h-8 rounded-full bg-[#272a2f] flex items-center justify-center"
                    >
                      ✕
                    </button>

                    {/* Image */}
                    <div className="mb-8">
                      <img 
                        src={minerContent?.image}
                        alt="Miner" 
                        className="w-[160px] h-[160px]"
                      />
                    </div>

                    {/* Title */}
                    <h3 className="text-3xl font-bold mb-3">{minerContent?.title}</h3>
                    
                    {/* Description */}
                    <p className="text-base text-[#85827d] text-center mb-8">
                      {minerContent?.description}
                    </p>

                    {/* Profit per hour */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[#85827d]">Profit per hour</span>
                      <img src="/coin.png" alt="Coin" className="w-5 h-5" />
                      <span className="text-[#f3ba2f]">+{minerContent?.profitPerHour}</span>
                    </div>

                    {/* Cost */}
                    <div className="flex items-center gap-2 mb-10">
                      <img src="/coin.png" alt="Coin" className="w-6 h-6" />
                      <span className="text-2xl text-[#f3ba2f]">{minerContent?.cost}</span>
                    </div>

                    {/* Purchase Button */}
                    <button
                      onClick={() => {
                        if (coins >= minerContent!.cost) {
                          setCoins(prev => Math.floor(prev - minerContent!.cost));
                          setProfitPerHour(prev => prev + minerContent!.profitPerHour);
                          setOverlayType(null);
                          setActiveTab('tap');
                        }
                      }}
                      disabled={!minerContent || coins < minerContent.cost}
                      className={`w-full py-4 rounded-lg text-xl font-bold ${
                        minerContent && coins >= minerContent.cost
                          ? 'bg-[#f3ba2f] text-black'
                          : 'bg-[#43433b] text-[#85827d]'
                      }`}
                    >
                      Go ahead
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}