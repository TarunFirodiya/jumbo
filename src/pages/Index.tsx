
import React from 'react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Find Your Perfect Home
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Search, match, and shortlist properties that fit your unique lifestyle
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Link 
              to="/preferences"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow-md transition duration-300 flex items-center justify-center"
            >
              Start Your Search
            </Link>
            <Link 
              to="/buildings"
              className="bg-white hover:bg-gray-100 text-blue-600 font-medium py-3 px-6 rounded-lg shadow-md border border-gray-200 transition duration-300 flex items-center justify-center"
            >
              Browse Properties
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Personalized Matching</h3>
              <p className="text-gray-600">Tell us your preferences and we'll find homes that match your lifestyle.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Shortlist &amp; Compare</h3>
              <p className="text-gray-600">Save properties you like and take notes to help with your decision.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Smart Recommendations</h3>
              <p className="text-gray-600">Discover properties that align with your unique requirements.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
