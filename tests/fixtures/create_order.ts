export default {
  items: [
    {
      hash: 'Tec-9 | Army Mesh (Battle-Scarred)',
      count: 1,
      payload: 'orders item #1',
      max_price: 10,
    },
    {
      hash: 'USP-S | Torque (Well-Worn)',
      count: 1,
      payload: 'orders item #2',
      max_price: 1,
    },
  ],
  recipient: {
    trade_url: 'https://steamcommunity.com/tradeoffer/new/?partner=<partner>&token=<token>',
  },
  sender: {
    api_key: 'test_api_key',
    agent_id: 'James Bond',
  },
  config: {
    comment: 'Items request from csgo.com',
    priority: 100,
    quality: 'same',
    vendors: [
      'OpSkins',
      'BitSkins',
    ],
    force_vendors: false,
  },
};
