
import React from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-orange-500 to-blue-600 w-10 h-10 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">TransparenciaCiudadana</h1>
              <p className="text-xs text-gray-500">Plataforma de Denuncias</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar denuncias, entidades, ubicaciones..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-gray-50"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-orange-600 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </button>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-800">Juan Pérez</p>
                <p className="text-xs text-gray-500">Ciudadano Activo</p>
              </div>
              <div className="bg-gradient-to-r from-orange-400 to-blue-500 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Mobile Menu */}
            <button className="md:hidden p-2 text-gray-600">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
