-- Insert sample news data
INSERT INTO public.news (title, excerpt, content, image_url, category, read_time, views, published) VALUES
(
  'Nova Técnica de Cultivo Sustentável Desenvolvida em Ubatuba',
  'Pesquisadores da AMESP desenvolvem método inovador que aumenta produtividade em 40% mantendo sustentabilidade.',
  'Uma nova técnica revolucionária de cultivo sustentável foi desenvolvida pelos pesquisadores da AMESP em parceria com universidades locais. O método, que combina tecnologia de ponta com práticas tradicionais, conseguiu aumentar a produtividade em até 40% enquanto mantém os mais altos padrões de sustentabilidade ambiental.

A técnica envolve o uso de sistemas de monitoramento inteligente que controlam automaticamente a qualidade da água, temperatura e níveis de oxigênio, garantindo condições ideais para o crescimento dos organismos marinhos. Além disso, o sistema utiliza energia renovável e práticas de economia circular.

"Este é um marco importante para a maricultura brasileira", afirma o Dr. João Silva, coordenador da pesquisa. "Conseguimos provar que é possível aumentar a produção sem comprometer o meio ambiente."

O projeto piloto foi implementado em três fazendas marinhas diferentes no litoral norte de São Paulo, todas com resultados consistentes. A AMESP planeja expandir a implementação desta técnica para todos os produtores associados ao longo dos próximos dois anos.',
  '/sustainable-aquaculture-farm-with-workers-in-boats.jpg',
  'Inovação',
  5,
  1250,
  true
),
(
  'Workshop Nacional Reúne 200 Especialistas em Maricultura',
  'Evento histórico marca novo marco para o setor com apresentação de tecnologias revolucionárias.',
  'O I Workshop Nacional da Maricultura foi um sucesso absoluto, reunindo mais de 200 especialistas, pesquisadores, produtores e representantes do governo de todo o Brasil. O evento, realizado em Ubatuba-SP, marcou um novo capítulo na história da maricultura nacional.

Durante os três dias de evento, foram apresentadas mais de 50 palestras técnicas, 20 workshops práticos e diversas demonstrações de tecnologias inovadoras. Os temas abordados incluíram sustentabilidade, novas espécies para cultivo, tecnologias de monitoramento, certificação internacional e mercados emergentes.

Um dos destaques foi a apresentação da nova plataforma digital de rastreabilidade, que permite acompanhar todo o ciclo produtivo desde a fazenda até o consumidor final. Esta tecnologia blockchain garante a autenticidade e qualidade dos produtos da maricultura brasileira.

O evento também serviu como plataforma para importantes anúncios de políticas públicas, incluindo novos investimentos em pesquisa e desenvolvimento, programas de capacitação para produtores e incentivos fiscais para práticas sustentáveis.

"Este workshop representa a união do setor em torno de objetivos comuns: crescimento sustentável, inovação tecnológica e excelência na qualidade", destacou Maria Santos, presidente da AMESP.',
  '/professional-conference-room-with-aquaculture-expe.jpg',
  'Eventos',
  3,
  890,
  true
),
(
  'Certificação Internacional para Produtores Associados',
  'AMESP conquista selo de qualidade internacional, beneficiando todos os produtores associados.',
  'A AMESP conquistou uma importante certificação internacional de qualidade e sustentabilidade, que beneficiará diretamente todos os produtores associados. O selo ASC (Aquaculture Stewardship Council) é reconhecido mundialmente como o padrão ouro em aquicultura responsável.

Esta certificação é resultado de dois anos de trabalho intenso, envolvendo auditorias rigorosas, implementação de novos protocolos de qualidade e treinamento extensivo de todos os produtores. O processo incluiu avaliações detalhadas de práticas ambientais, bem-estar animal, responsabilidade social e rastreabilidade.

Com esta certificação, os produtos dos associados da AMESP agora têm acesso privilegiado aos mercados internacionais mais exigentes, incluindo Europa, Estados Unidos e Japão. Estudos indicam que produtos certificados podem alcançar preços até 30% superiores no mercado internacional.

"Esta conquista representa anos de dedicação à excelência e sustentabilidade", comenta Carlos Oliveira, diretor técnico da AMESP. "Nossos produtores agora podem competir no mais alto nível mundial, mantendo nosso compromisso com a preservação ambiental."

A certificação também inclui um programa de monitoramento contínuo e melhorias constantes, garantindo que os padrões sejam mantidos e aprimorados ao longo do tempo. Novos produtores interessados em se associar à AMESP passarão por um programa de capacitação específico para atender aos requisitos da certificação.',
  '/interactive-map-of-s-o-paulo-coast-showing-aquacul.jpg',
  'Certificação',
  4,
  2100,
  true
);

-- Insert sample producers data
INSERT INTO public.producers (name, description, location, latitude, longitude, contact_email, contact_phone, specialties, certification_level, active) VALUES
(
  'Fazenda Marinha São Sebastião',
  'Especializada no cultivo sustentável de mexilhões e ostras com tecnologia de ponta.',
  'São Sebastião - SP',
  -23.8103,
  -45.4037,
  'contato@fazendass.com.br',
  '(12) 3892-1234',
  ARRAY['Mexilhões', 'Ostras', 'Vieiras'],
  'ASC Certificado',
  true
),
(
  'Aquicultura Ubatuba',
  'Produção orgânica de frutos do mar com foco em sustentabilidade e qualidade premium.',
  'Ubatuba - SP',
  -23.4336,
  -45.0838,
  'info@aquiubatuba.com.br',
  '(12) 3833-5678',
  ARRAY['Ostras', 'Camarões', 'Peixes Marinhos'],
  'Orgânico Certificado',
  true
),
(
  'Maricultura Caraguatatuba',
  'Pioneira em técnicas inovadoras de cultivo em águas profundas.',
  'Caraguatatuba - SP',
  -23.6203,
  -45.4129,
  'contato@maricaragua.com.br',
  '(12) 3897-9012',
  ARRAY['Salmão', 'Robalo', 'Linguado'],
  'ISO 14001',
  true
),
(
  'Cultivos Marinhos Ilhabela',
  'Especializada em espécies nativas com programas de conservação marinha.',
  'Ilhabela - SP',
  -23.7781,
  -45.3581,
  'cultivos@ilhabela.com.br',
  '(12) 3896-3456',
  ARRAY['Espécies Nativas', 'Conservação', 'Pesquisa'],
  'Certificação Ambiental',
  true
);

-- Insert sample gallery data
INSERT INTO public.gallery (title, description, image_url, category, featured, display_order) VALUES
(
  'Cultivo Sustentável',
  'Fazendas aquícolas modernas utilizando as mais avançadas técnicas de sustentabilidade',
  '/sustainable-aquaculture-farm-with-workers-in-boats.jpg',
  'Produção',
  true,
  1
),
(
  'Eventos Técnicos',
  'Capacitação profissional e workshops para desenvolvimento do setor',
  '/professional-conference-room-with-aquaculture-expe.jpg',
  'Educação',
  true,
  2
),
(
  'Mapeamento Costeiro',
  'Tecnologia de ponta para monitoramento e gestão das áreas de cultivo',
  '/interactive-map-of-s-o-paulo-coast-showing-aquacul.jpg',
  'Tecnologia',
  true,
  3
);
