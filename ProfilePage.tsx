import { 
  User, 
  Bell, 
  Lock, 
  CreditCard, 
  HelpCircle, 
  FileText, 
  Settings, 
  LogOut,
  ChevronRight,
  Shield,
  Smartphone
} from "lucide-react";

const menuSections = [
  {
    title: "Account",
    items: [
      { icon: User, label: "Personal Information", color: "text-blue-600" },
      { icon: CreditCard, label: "Linked Accounts", color: "text-green-600" },
      { icon: Smartphone, label: "Devices", color: "text-purple-600" },
    ],
  },
  {
    title: "Preferences",
    items: [
      { icon: Bell, label: "Notifications", color: "text-orange-600", badge: "3" },
      { icon: Shield, label: "Security & Privacy", color: "text-red-600" },
      { icon: Settings, label: "App Settings", color: "text-gray-600" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: HelpCircle, label: "Help Center", color: "text-indigo-600" },
      { icon: FileText, label: "Terms & Policies", color: "text-teal-600" },
    ],
  },
];

export function ProfilePage() {
  return (
    <div className="pb-20 pt-4">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 mb-6 text-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
              <User className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl text-white mb-1">John Doe</h3>
              <p className="text-white/80 text-sm">john.doe@email.com</p>
              <p className="text-white/80 text-sm">+1 (555) 123-4567</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <p className="text-white/80 text-xs mb-1">Member Since</p>
              <p className="text-white">Jan 2023</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <p className="text-white/80 text-xs mb-1">Account Status</p>
              <p className="text-white">Premium</p>
            </div>
          </div>
        </div>

        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            <h4 className="px-2 mb-3 text-muted-foreground">{section.title}</h4>
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <button
                    key={itemIndex}
                    className={`w-full flex items-center gap-4 p-4 hover:bg-accent transition-colors ${
                      itemIndex !== section.items.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div className={`${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="flex-1 text-left">{item.label}</span>
                    {"badge" in item && item.badge && (
                      <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <button className="w-full flex items-center justify-center gap-3 p-4 bg-destructive/10 text-destructive rounded-2xl hover:bg-destructive/20 transition-colors">
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Version 2.5.1
        </p>
      </div>
    </div>
  );
}
