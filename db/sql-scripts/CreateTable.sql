create table `order` (`id` int unsigned not null auto_increment primary key, `status` int default '0', `distance` int default '0', `create_date` varchar(255) not null, `last_update_date` varchar(255) not null) default character set utf8