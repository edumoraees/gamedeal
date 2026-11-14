-- Histórico de demonstração (ids de usuários/anúncios iguais aos seeds do auth e do catalog)
INSERT INTO tb_order (buyer_id, buyer_name, seller_id, seller_name, listing_id, listing_title, listing_image,
                      category, game_name, unit_price, quantity, subtotal, service_fee, total, seller_net,
                      status, created_at, completed_at) VALUES
    (1, 'Lula_Trader', 2, 'Nick', 7, 'Valorant Silver to Diamond Carry',
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        'SERVICO', 'Valorant', 240.00, 1, 240.00, 6.00, 246.00, 216.00,
        'COMPLETED', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
    (3, 'Demon_Trader', 1, 'Lula_Trader', 6, '20.000 WoW Gold',
        'https://images.unsplash.com/photo-1541140532154-b024d705b90a?auto=format&fit=crop&w=900&q=80',
        'MOEDA', 'World of Warcraft', 18.50, 1, 18.50, 0.46, 18.96, 16.65,
        'COMPLETED', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days');

INSERT INTO tb_review (order_id, seller_id, buyer_id, buyer_name, rating, comment, tags) VALUES
    (1, 2, 1, 'Lula_Trader', 5, 'Subiu meu elo rápido e ainda me ensinou muito!', 'Entrega Rápida,Boa Comunicação,Recomendo'),
    (2, 1, 3, 'Demon_Trader', 5, 'Gold entregue em 10 minutos.', 'Entrega Rápida,Confiável');
