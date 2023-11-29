export type Vendors = 'bitskins' | 'opskins';

export interface Bot {
    id: number;
    steamid: string;
    username: string;
    password: string;
    shared_secret: string;
    identity_secret: string;
    steam_token: string;
    type: string;
    url: string;
    active: boolean;
    ready: boolean;
    last_ready_at: string;
}

export enum Bots {
    inventory,
    stickers,
    presents,
    ready,
}

export type BotType = 'inventory' | 'stickers';

export type OrderStatus = 'error' | 'done' | 'process' | 'empty' | 'new' | 'no-bots' | 'bot-error' | 'buy-done' | 'trade-url-error' | 'pending-trade-offers-error';

export type ItemStatus = 'new' | 'process' | 'buying' | 'buy-success' | 'buy-error';

export type OrderFlow = 'stickers' | 'buy' | 'presents';

export type Game = 'csgo' | 'dota' | 'h1z1' | 'pubg' | 'steam' | 'multi';

export interface Order {
    id: number;
    client_id: string;
    game: Game;
    flow: OrderFlow;
    status: string;
    tries: number;
    bot_id?: number|null;
    trade_url: string;
    agent_id: string;
    comment: string;
    priority: number;
    quality: ItemQuality;
    vendors: string;
    force_vendors: boolean;
    error_log: string;
    tradeofferid?: string;
    screenshot?: string;
}

export type ItemQuality = 'same' | 'normal' | 'good' | 'cheap';

export interface OrderItem {
    id?: number;
    game?: Game,
    order_id?: number;
    bot_id?: number|null;
    price?: number;
    vendor: Vendors;
    storehouse_id?: number|null;
    status: string;
    hash: string;
    count: number;
    payload: string;
    max_price: number;
}

export interface Purchase {
    id?: number;
    bot_id: number;
    provider: Vendors;
    items: string;
    price: number;
    withdrawn?: boolean;
    buy_log?: string;
    withdrawn_log?: string;
}

export interface Storehouse {
    id?: number;
    bot_steamid: string;
    order_item_id: number;
    hash: string;
    price?: number;
    vendor?: Vendors;
    assetid: string;
    classid: string;
    instanceid: string;
    status: string;
}

export interface VendorApi {
    readonly name: Vendors;
    find(hash: string, requestParams: VendorSearch): Promise<VendorFindResult>;
    buy(items: VendorItem[], bot: Bot): Promise<VendorBuyResult>;
}

export interface VendorItem {
    id: string;
    hash: string;
    price: number;
    suggested: number;
    stickers: number;
    instance_id: string | number;
    class_id: string | number;
    vendor: Vendors;
}

export interface VendorSearch {
    page?: number;
    max_price?: number;
    sort?: string;
    strictMatch?: boolean;
}

export type Status = 'success' | 'error' | 'error-withdraw';

export interface VendorBuyResult extends Result {
    tokens: any[];
    message?: string;
}

export interface Result {
    result: Status;
}

export interface VendorFindResult extends Result {
    items: VendorItem[];
    params?: any;
}

export interface Flow {
    run();
}
