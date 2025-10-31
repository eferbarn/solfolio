"use client"

export function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5" />

      {/* Animated dots */}
      <div className="absolute inset-0">
        {/* Large dots */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`large-${i}`}
            className="absolute h-2 w-2 rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          />
        ))}

        {/* Medium dots */}
        {[...Array(30)].map((_, i) => (
          <div
            key={`medium-${i}`}
            className="absolute h-1.5 w-1.5 rounded-full bg-gradient-to-br from-purple-400/20 to-cyan-400/20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${12 + Math.random() * 8}s`,
            }}
          />
        ))}

        {/* Small dots */}
        {[...Array(50)].map((_, i) => (
          <div
            key={`small-${i}`}
            className="absolute h-1 w-1 rounded-full bg-gradient-to-br from-purple-300/15 to-cyan-300/15 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Pulsing dots grid */}
      <div className="absolute inset-0 opacity-30">
        <div className="grid h-full w-full grid-cols-12 gap-8 p-8">
          {[...Array(60)].map((_, i) => (
            <div
              key={`grid-${i}`}
              className="h-1 w-1 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 animate-pulse"
              style={{
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
