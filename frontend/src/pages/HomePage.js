import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';

const HomePage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  const fetchCampaigns = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/campaigns`);
      setCampaigns(data);
    } catch (error) {
      console.error('Fetch campaigns error:', error);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const categories = [
    {
      id: '8k',
      title: '8 Ayar Altın',
      image: 'https://images.unsplash.com/photo-1611107683227-e9060eccd846?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTZ8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBnb2xkJTIwamV3ZWxyeXxlbnwwfHx8fDE3ODAzMjQ2OTh8MA&ixlib=rb-4.1.0&q=85',
      description: 'Zarif ve şık tasarımlar'
    },
    {
      id: '14k',
      title: '14 Ayar Altın',
      image: 'https://customer-assets.emergentagent.com/job_mir-jewelry-shop/artifacts/zu099bk7_3231.jpg',
      description: 'Dayanakli ve modern'
    },
    {
      id: '21k',
      title: '21 Ayar Altın',
      image: 'https://images.unsplash.com/photo-1592317295760-5c1f677dfc78?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTZ8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBnb2xkJTIwamV3ZWxyeXxlbnwwfHx8fDE3ODAzMjQ2OTh8MA&ixlib=rb-4.1.0&q=85',
      description: 'Premium kalite'
    },
    {
      id: '22k',
      title: '22 Ayar Altın',
      image: 'https://images.unsplash.com/photo-1617191880362-aac615de3c26?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTZ8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjBnb2xkJTIwamV3ZWxyeXxlbnwwfHx8fDE3ODAzMjQ2OTh8MA&ixlib=rb-4.1.0&q=85',
      description: 'En saf altın'
    }
  ];

  return (
    <div className="pt-16 md:pt-20" data-testid="home-page">
      <section className="hero-section relative h-[500px] md:h-[600px] overflow-hidden" data-testid="hero-section">
        <img
          src="https://static.prod-images.emergentagent.com/jobs/ca0ba447-1b1a-4344-a291-0dbbc38054da/images/111458a6419fdd6f99dc2649f6a63c6bc4fd64b1c1a5b74fdc3728b203f3664e.png"
          alt="Luxury Gold Jewelry"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h2 className="heading-font text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight leading-none">
              Zamansız Zarafet
            </h2>
            <p className="text-base md:text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Özel tasarım altın takılarla stilinizi tamamlayın
            </p>
            <Link to="/products/14k">
              <Button className="btn-gold px-8 py-6 rounded-md text-lg font-semibold" data-testid="hero-cta-button">
                Koleksiyonu Keşfedin
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white" data-testid="categories-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="heading-font text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A1A1A] mb-4">
              Kategorilerimiz
            </h3>
            <p className="text-[#7A7A7A] text-base md:text-lg max-w-2xl mx-auto">
              Farklı ayar seçenekleriyle size özel altın takılar
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products/${category.id}`}
                className="category-card rounded-md overflow-hidden card-hover"
                data-testid={`category-card-${category.id}`}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <h4 className="heading-font text-xl md:text-2xl font-semibold text-[#1A1A1A] mb-2">
                    {category.title}
                  </h4>
                  <p className="text-[#7A7A7A] text-sm">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {campaigns.length > 0 && (
        <section className="py-16 md:py-24 bg-[#FAFAFA]" data-testid="campaigns-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="heading-font text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A1A1A] mb-4">
                Kampanyalar
              </h3>
              <p className="text-[#7A7A7A] text-base md:text-lg">
                Sezonun en avantajlı fırsatları
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign, index) => (
                <div
                  key={campaign.id}
                  className={`category-card rounded-md overflow-hidden card-hover ${index === 0 ? 'md:col-span-2 md:row-span-1' : ''}`}
                  data-testid={`campaign-card-${campaign.id}`}
                >
                  <div className={`${index === 0 ? 'aspect-[2/1]' : 'aspect-square'} overflow-hidden relative`}>
                    <img
                      src={campaign.image_url}
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                      <span className="inline-block bg-[#D4AF37] text-white px-3 py-1 rounded-full text-sm font-semibold mb-2 self-start">
                        {campaign.discount}
                      </span>
                      <h4 className="heading-font text-2xl md:text-3xl font-bold text-white mb-2">
                        {campaign.title}
                      </h4>
                      <p className="text-white/90 text-sm md:text-base">{campaign.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;