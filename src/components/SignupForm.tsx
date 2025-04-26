
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MapPin, User, Phone, Building, Mail } from "lucide-react";

interface SignupFormProps {
  onSubmit: (formData: {
    name: string;
    phoneNumber: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
  }) => void;
  isLoading: boolean;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-lg">
      <CardHeader className="pb-6 space-y-1">
        <CardTitle className="text-xl md:text-2xl font-bold text-center">Sign Up</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <div className="relative">
              <label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1 block">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="pl-10 h-12 text-base md:text-sm"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700 mb-1 block">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="pl-10 h-12 text-base md:text-sm"
                  required
                  pattern="[0-9]*"
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Address Information</h3>
            
            <div className="relative">
              <label htmlFor="streetAddress" className="text-sm font-medium text-gray-700 mb-1 block">
                Street Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="streetAddress"
                  name="streetAddress"
                  placeholder="123 Main St"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  className="pl-10 h-12 text-base md:text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label htmlFor="city" className="text-sm font-medium text-gray-700 mb-1 block">
                  City
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="city"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="pl-10 h-12 text-base md:text-sm"
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <label htmlFor="state" className="text-sm font-medium text-gray-700 mb-1 block">
                  State
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="state"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="pl-10 h-12 text-base md:text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="relative">
              <label htmlFor="zipCode" className="text-sm font-medium text-gray-700 mb-1 block">
                ZIP Code
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="zipCode"
                  name="zipCode"
                  placeholder="12345"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="pl-10 h-12 text-base md:text-sm"
                  required
                  pattern="[0-9]*"
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 text-base font-medium mt-6 bg-gradient-to-r from-accent to-primary hover:opacity-90"
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
