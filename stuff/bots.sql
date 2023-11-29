# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: 207.154.203.140 (MySQL 5.7.17-0ubuntu0.16.10.1)
# Database: csgo
# Generation Time: 2017-03-23 13:41:27 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table bots_copy
# ------------------------------------------------------------

LOCK TABLES `bots_copy` WRITE;
/*!40000 ALTER TABLE `bots_copy` DISABLE KEYS */;

INSERT INTO `bots_copy` (`id`, `steamid`, `username`, `password`, `shared_secret`, `identity_secret`, `active`, `steam_token`, `enabled`, `type`, `url`, `updated_at`, `created_at`)
VALUES
	(1,'76561198338825683','parov_t','ZrOYUyH6Ol','aRc5qnqNHlbHDxGJyOs/qLEps6U=','LYB8CPJ73V1V13+2sEBv/CWRQHM=',1,'rjNFGJt3',1,'inventory','http://localhost:3000','2017-03-19 22:10:30','2017-02-01 14:52:40'),
	(2,'76561198357037155','dunsilik','PBq1O3t%cY#7Pgbr','tbjfMr9T8k1Ar7iJ7ZEAJpaXgjM=','UWR5eDExHumZD+tS8ar6KAnQSbQ=',0,'iCAztX8N',1,'inventory','http://localhost:3000','2017-03-19 22:10:30','2017-02-24 12:07:57'),
	(3,'76561198560701495','jadafopo','PBq1O3t%cY#7Pgbr','o+t8dY5vNBfCBwjjq4qCQFYeBO4=','f/BBlOsz5zZtXJI3Ey925F+Sdj4=',0,'wiNdKuqa',0,'inventory','http://localhost:3000','2017-02-24 15:23:53','2017-02-24 12:07:57'),
	(4,'76561198356532313','vynsiha','PBq1O3t%cY#7Pgbr','ZJ4V0oZJcun9zuVTcUZmBNWu4pc=','TXrtVVtNKL9InUdRHroEoT7dPMk=',0,'a02CvXSn',0,'inventory','http://localhost:3000','2017-02-24 15:23:54','2017-02-24 12:07:57'),
	(5,'76561198356143708','kijybyh','PBq1O3t%cY#7Pgbr','GXBR9NksXWowLn2CRO7LrMXNjP8=','c0ze1cXa2Qp4ODaUwQgAZQ/z+CA=',0,'Lns5tliu',0,'inventory','http://localhost:3000','2017-02-24 15:23:54','2017-02-24 12:07:57'),
	(6,'76561198356165840','cunsinad','PBq1O3t%cY#7Pgbr','wQFPqwEeg2AsEVY++dLnuOgTgmU=','Nowy3SiHbpqWd1B6Q3/liU+yiMc=',0,'IBRLedjw',0,'inventory','http://localhost:3000','2017-02-24 15:23:54','2017-02-24 12:07:57'),
	(7,'76561198356898946','berdunu','wfI7Q|Flct#_X@HF','RmIrAlmvUBAZhhAbLfL6bqrZ8wE=','ra15DnzbkjOmYguazKXEChdXXhI=',0,'vmAbSD49',0,'inventory','http://localhost:3000','2017-02-24 15:23:54','2017-02-24 12:07:57'),
	(8,'76561198356690210','gunonad','wfI7Q|Flct#_X@HF','adB55Z5fYqknIkic6ZY4wA5/NWU=','+3ZQQMKqnfW+ZtuM88Z+NxKdzwA=',0,'qQhAbKfN',0,'inventory','http://localhost:3000','2017-02-24 15:23:54','2017-02-24 12:07:57'),
	(9,'76561198356534656','hundoca','wfI7Q|Flct#_X@HF','JynPmVzgjUp71FaC+GtlYkWzyec=','7wgC970adc/kX1f+RaPm70wKrrU=',0,'g0aYVmjU',0,'inventory','http://localhost:3000','2017-02-24 15:23:54','2017-02-24 12:07:57'),
	(10,'76561198358599623','linumuki','wfI7Q|Flct#_X@HF','vL6vi7cGA6gV98Q/nmjZ1K6tdQY=','29rq2GGrweNBry8gDTawAqZJqxc=',0,'EWzZgLRE',0,'inventory','http://localhost:3000','2017-02-24 15:23:54','2017-02-24 12:07:57'),
	(11,'76561198356163971','forranov','wfI7Q|Flct#_X@HF','UgraLfd9j5sCkOBwMfiOfeErTak=','JYkr961vqTc78fiHSUl4qKpY67o=',0,'lSPheMJB',0,'inventory','http://localhost:3000','2017-02-24 15:23:54','2017-02-24 12:07:57'),
	(12,'76561198356193955','pinygi','g9s4gS49kRPM','WNQZjy7uNMKlCmdWrhRK5CA0PG4=','7XjwWvjqx3wDlYZEV37DpoDEUgc=',0,'h-bWht7k',0,'inventory','http://localhost:3000','2017-03-17 11:57:19','2017-03-17 11:56:36');

/*!40000 ALTER TABLE `bots_copy` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
