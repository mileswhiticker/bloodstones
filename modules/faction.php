
<?php

//define("FACTION_CORSAIRS", 6);

trait faction
{
	function getPlayerFactionId($check_player_id)
	{
		return self::getUniqueValueFromDB("SELECT player_factionid FROM player WHERE player_id='$check_player_id'");
	}
	
	function getPlayerFactionName($player_id)
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::getPlayerFactionName($player_id)"));
		$faction_id = $this->getPlayerFactionId($player_id);
		return $this->getFactionName($faction_id);
	}
	
	function isValidFactionId($check_faction_id)
	{
		return (0 <= $check_faction_id && 5 >= $check_faction_id && is_numeric($check_faction_id));
	}
	
	function getFactionName($faction_id)
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::getFactionName($faction_id)"));
		switch($faction_id)
		{
			case self::FACTION_HORSELORDS:
			{
				return "Horse Lords";
			}
			case self::FACTION_HILLFOLK:
			{
				return "Hill Folk";
			}
			case self::FACTION_DRAGONRIDERS:
			{
				return "Dragon Riders";
			}
			case self::FACTION_CORSAIRS:
			{
				return "Corsairs";
			}
			case self::FACTION_NECROMANCERS:
			{
				return "Necromancers";
			}
			case self::FACTION_CHAOSHORDE:
			{
				return "Chaos Horde";
			}
		}
		
		return "faction$faction_id";
	}
	
	function getCorsairPlayerId()
	{
		//there's a chance this might be useful later, although it's unused for now
		//corsairs have a lot of snowflake rules
		$players = self::getCollectionFromDb("SELECT player_id id, player_factionid factionid FROM player");
		foreach($players as $player_id => $player)
		{
			if($player["factionid"] == self::FACTION_CORSAIRS)
			{
				return $player_id;
			}
		}
		
		return 0;
	}
	
	function countFactionVillagesAvailable($faction_id)
	{
		return $this->villages_deck->countCardInLocation("hand", $faction_id);
	}
	
	function countFactionVillagesBuilt($faction_id)
	{
		return $this->villages_deck->countCardInLocation("province", $faction_id);
	}
	
	function countFactionVillagesCaptured($faction_id)
	{
		return $this->villages_deck->countCardInLocation("captured", $faction_id);
	}
	
	function getVillagesBuiltFactionInfos($faction_id)
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::getBuiltVillagesFaction($faction_id)"));
		//see setupVillagesDeck() on line ~307 of setup.php
		//getCardsOfTypeInLocation( $type, $type_arg=null, $location, $location_arg = null )
		$village_infos = $this->villages_deck->getCardsOfTypeInLocation("village", $faction_id, "province", null);
		
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($village_infos, true)));
		
		return $village_infos;
	}
	
}
