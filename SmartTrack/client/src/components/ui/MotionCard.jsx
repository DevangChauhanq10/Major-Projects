
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const MotionCard = ({ children, className, delay = 0, onClick, hoverEffect = true }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: delay,
        ease: "easeOut"
      }}
      whileHover={hoverEffect ? { 
        y: -3,
        boxShadow: "0 4px 20px -5px rgba(0,0,0,0.05)",
        borderColor: "hsl(var(--primary))" 
      } : {}}
      whileTap={onClick ? { scale: 0.99 } : {}}
      onClick={onClick}
      className={cn(
        "bg-card border border-border rounded-xl p-6 transition-all",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export default MotionCard;
