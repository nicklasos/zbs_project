select count(*) as items_count, bots.id, bots.username
from `bots`
left join `storehouse` on `bots`.`steamid` = `storehouse`.`bot_steamid`
where `bots`.`enabled` = 1 and `bots`.`ready` = 1 and `storehouse`.`status` = 'available' and `storehouse`.`hash` like '%Graffiti%'
group by `bots`.`id`
