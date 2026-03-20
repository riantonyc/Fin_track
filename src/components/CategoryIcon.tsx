import { 
  Utensils, Car, ShoppingBag, FileText, Wallet, 
  Sparkles, Home, Laptop, Coffee, Heart, 
  Briefcase, GraduationCap, Package, 
  CircleDollarSign, Landmark, Activity, Music, Plane,
  Gamepad, Tv, Smartphone, Camera, Train, Bus, Map,
  Book, Pen, Palette, Scissors, Droplet, Flame, Zap,
  Sun, Moon, Cloud, Umbrella, Anchor, Bike, Ticket,
  Clapperboard, Video, Mic, Headphones, Speaker, Bell,
  Gift, Award, Trophy, Crown, Shield, Lock, Key,
  TrendingUp, TrendingDown, CreditCard, Banknote, PiggyBank,
  Receipt, ShoppingCart, Percent, Share, Star
} from 'lucide-react'

export const IconMap: Record<string, React.ElementType> = {
  Utensils, Car, ShoppingBag, FileText, Wallet, 
  Sparkles, Home, Laptop, Coffee, Heart, 
  Briefcase, GraduationCap, Package,
  CircleDollarSign, Landmark, Activity, Music, Plane,
  Gamepad, Tv, Smartphone, Camera, Train, Bus, Map,
  Book, Pen, Palette, Scissors, Droplet, Flame, Zap,
  Sun, Moon, Cloud, Umbrella, Anchor, Bike, Ticket,
  Clapperboard, Video, Mic, Headphones, Speaker, Bell,
  Gift, Award, Trophy, Crown, Shield, Lock, Key,
  TrendingUp, TrendingDown, CreditCard, Banknote, PiggyBank,
  Receipt, ShoppingCart, Percent, Share, Star
}

export function CategoryIcon({ name, className = "w-5 h-5 flex-shrink-0" }: { name: string, className?: string }) {
  if (!name) return null;
  const IconComponent = IconMap[name]
  
  if (IconComponent) {
    return <IconComponent className={className} />
  }
  
  // Jika itu adalah emoji (dari rekam jejak versi sebelumnya), render sebagai teks
  return <span style={{ fontSize: '1.1em', lineHeight: 1, display: 'inline-block' }}>{name}</span>
}
