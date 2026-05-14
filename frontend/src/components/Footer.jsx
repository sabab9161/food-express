import { Clock, Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="container-page grid gap-8 py-10 md:grid-cols-4">
        <div>
          <h3 className="text-lg font-black text-ink">FoodExpress</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Fresh meals from local kitchens delivered fast, warm, and reliably.
          </p>
        </div>
        <div>
          <h4 className="font-bold">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>About</li>
            <li>Partner Restaurants</li>
            <li>Careers</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold">Support</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>Help Center</li>
            <li>Delivery Areas</li>
            <li>Terms</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold">Contact</h4>
          <ul className="mt-3 space-y-3 text-sm text-slate-600">
            <li className="flex gap-2"><MapPin size={16} /> Downtown Food District</li>
            <li className="flex gap-2"><Phone size={16} /> +1 555 0100</li>
            <li className="flex gap-2"><Mail size={16} /> hello@foodexpress.local</li>
            <li className="flex gap-2"><Clock size={16} /> 9:00 AM - 11:00 PM</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
