<?php

trait tiles
{
	public function getTilePipsFromId($tile_id, $deck)
	{
		$tile_id = (int)$tile_id;
		$tile_info = $deck->getCard($tile_id);
		return $this->getTilePipsFromInfo($tile_info);
	}
	
	public function getTilePipsFromIdPlayer($tile_id, $player_id)
	{
		$deck = $this->player_decks[$player_id];
		return $this->getTilePipsFromId($tile_id, $deck);
	}
	
	public function getTilePipsFromInfo($tile_info)
	{
		$tile_type = $tile_info["type_arg"];
		return $this->getTilePipsFromType($tile_type);
	}
	
	public function getTilePipsFromType($tile_type)
	{
		$tile_pips = [
			"0","5","0","4","3","2","3","4","4","3","5","0","0",
			"0","5","2","4","3","2","3","4","4","3","5","5","0",
			"0","5","2","4","3","2","3","4","4","3","5","5","0",
			"0","5","0","4","3","2","0","4","4","3","5","0","0",
			"0","5","3","4","3","2","3","4","4","3","5","5","0",
			"0","5","3","0","0","0","4","0","4","0","5","0","0",
			"0","1","2","3","4","5","0","0","0","0","0","0","0",
			"0","1","2","3","4","5","0","0","0","0","0","0","0",
		];
		return $tile_pips[(int)$tile_type];
	}
	
	public function getTileNameFromType($tile_type)
	{
		//unique type handling
		switch($tile_type)
		{
			case self::TILE_GIANT:
			{
				return "Giant";
			}
			case self::TILE_KOBOLD:
			{
				return "Kobold";
			}
			case self::TILE_DRAGON:
			{
				return "Dragon";
			}
			case self::TILE_GOBLIN:
			{
				return "Goblin";
			}
			case self::TILE_NECROMANCER:
			{
				return "Necromancer";
			}
			case self::TILE_UNDEAD:
			{
				return "Undead";
			}
		}
		
		//standard type handling
		if($tile_type <= 77)
		{
			$base_type = $this->getBaseTileType($tile_type);
			$base_names = [
				"Blank",
				"Resources",
				"Attacker infantry",
				"Sword infantry",
				"Shield infantry",
				"Skirmisher",
				"Cavalry",
				"Castle",
				"Ship",
				"Siege engine",
				"Leader",
			];
			return $base_names[$base_type];
		}
		
		//citadels
		if(84 <= $tile_type && 90 >= $tile_type)
		{
			return "Citadel";
		}
	}
	
	public function getBaseTileType($tile_type)
	{
		return $tile_type%self::SPRITESHEET_ROW_TILES;
	}
	
	function CheckTilesInHand($paid_tile_infos, $player_id)
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::CheckTilesInHand([], $player_id)"));
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($paid_tile_infos,true)));
		$player_deck = $this->player_decks[$player_id];
		foreach($paid_tile_infos as $index => $paid_tile_info)
		{
			$paid_tile_id = $paid_tile_info["id"];
			$tile_info = $player_deck->getCard($paid_tile_id);
			//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($tile_info,true)));
			if($tile_info["location"] != "hand")
			{
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "found tile not in hand!"));
				return false;
			}
		}
		
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "all tiles in hand"));
		return true;
	}
	
	public function isTileInPlayerHand($player_id, $tile_id)
	{
		$deck = $this->player_decks[$player_id];
		$tile = $deck->getCard($tile_id);
		$found = ($tile["location"] == "hand");
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::isTileInPlayerHand($player_id, $tile_id): $found"));
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($deck,true)));
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($tile,true)));
		return $found;
	}
	
	public function isTileTypeDice($tile_type)
	{
		return ($tile_type >= 78 && $tile_type <= 83) || ($tile_type >= 91 && $tile_type <= 96);
	}
	
	public function isTileTypeCitadel($tile_type)
	{
		return ($tile_type >= 84 && $tile_type <= 88);
	}
	
	public function isTileTypeStandard($tile_type)
	{
		return ($tile_type <= 77) && ($this->getBaseTileType($tile_type) != 0);
	}
	
	public function isTileTypeCastle($tile_type)
	{
		return ($this->getBaseTileType($tile_type) == self::TILE_BASE_CASTLE);
	}
	
	public function isTileTypeKobold($tile_type)
	{
		return ((int)$tile_type == self::TILE_KOBOLD);
	}
	
	public function isTileTypeGiant($tile_type)
	{
		return ((int)$tile_type == self::TILE_GIANT);
	}
	
	public function isTileTypeDragon($tile_type)
	{
		return ((int)$tile_type == self::TILE_DRAGON);
	}
	
	public function isTileTypeNecromancer($tile_type)
	{
		return ((int)$tile_type == self::TILE_NECROMANCER);
	}
	
	public function isTileTypeUndead($tile_type)
	{
		return ((int)$tile_type == self::TILE_UNDEAD);
	}
	
	public function isTileTypeGoblin($tile_type)
	{
		return ((int)$tile_type == self::TILE_GOBLIN);
	}
	
	public function isTileTypeCavalry($tile_type)
	{
		return ($this->getBaseTileType($tile_type) == self::TILE_BASE_CAVALRY);
	}
	
	public function DoesTileTypeDieInDesert($tile_type)
	{
		if($this->isTileTypeGoblin($tile_type))
		{
			return false;
		}
		if($this->isTileTypeKobold($tile_type))
		{
			return false;
		}
		if($this->isTileTypeDragon($tile_type))
		{
			return false;
		}
		if($this->isTileTypeUndead($tile_type))
		{
			return false;
		}
		return true;
	}
	
	public function checkTilePaymentInfos($paid_tile_infos, $check_pips = true)
	{
		$paid_tile_ids = array();
		foreach($paid_tile_infos as $paid_tile_id => $paid_tile_info)
		{
			array_push($paid_tile_ids, $paid_tile_info["id"]);
			//self::notifyAllPlayers("debug", "", array('debugmessage' => $paid_tile_info["id"]));
		}
		return $this->checkTilePaymentIds($paid_tile_ids, $check_pips);
	}
	
	public function checkTilePaymentIds($paid_tile_ids, $check_pips = true)
	{
		$active_player_id = self::getActivePlayerId();
		$amount_paid = 0;
		$retval = ["failure_reason" => self::ACTION_FAIL_UNKNOWN, "amount_paid" => 0];
		
		//if $check_pips is true, check the pips value of the tiles
		//if $check_pips is false, simply count the number of tiles
		foreach($paid_tile_ids as $index => $paid_tile_id)
		{
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "paid_tile_id:$paid_tile_id"));
			//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($paid_tile_info,true)));
			//is this tile actually in the player's hand? 
			if(!$this->isTileInPlayerHand($active_player_id, $paid_tile_id))
			{
				$retval["failure_reason"] = self::ACTION_FAIL_HAND;
				return $retval;
			}
			
			//what is the value of this paid tile?
			if($check_pips)
			{
				$amount_paid += $this->getTilePipsFromIdPlayer($paid_tile_id, $active_player_id);
			}
			else
			{
				$amount_paid += 1;
			}
			
			//self::notifyAllPlayers("debug", "", array('debugmessage' => $paid_tile["id"]));
		}
		
		$retval["amount_paid"] = $amount_paid;
		if($amount_paid == 0)
		{
			$retval["failure_reason"] = self::ACTION_FAIL_COST;
		}
		
		return $retval;
	}
	
	public function getTileCombatBonus($tile_type, $player_id, $is_attacking)
	{
		$tile_type = intval($tile_type);
		$numtypes = self::SPRITESHEET_ROW_TILES;
		
		//citadels give +5
		if($this->isTileTypeCitadel($tile_type))
		{
			//will only ever be defending so we dont need to check
			return 5;
		}
		
		//dice tiles just use their face value
		$base_type = $this->getBaseTileType($tile_type);
		if($this->isTileTypeDice($tile_type))
		{
			return $base_type;
		}
		
		$cur_province = $this->getProvinceInfo($this->getGameStateValue("battling_province_id"));
		if($this->isTileTypeStandard($tile_type))
		{
			//standard combat units
			switch($base_type)
			{
				case 0:
				{
					//blank tile, shouldnt be buildable
					self::notifyAllPlayers("debug", "", array('debugmessage' => "ERROR: server::getTileCombatBonus($tile_type, $player_id, $is_attacking) blank tile"));
					break;
				}
				case 1:
				{
					//resources tile, shouldnt be buildable
					self::notifyAllPlayers("debug", "", array('debugmessage' => "ERROR: server::getTileCombatBonus($tile_type, $player_id, $is_attacking) resources tile"));
					break;
				}
				case 2:
				{
					//attacking infantry
					if($is_attacking)
					{
						return 1;
					}
					return 0;
				}
				case 3:
				{
					//sword infantry
					//always get +1
					return 1;
				}
				case 4:
				{
					//defending infantry
					if(!$is_attacking)
					{
						return 1;
					}
					return 0;
				}
				case 5:
				{
					//skirmisher infantry
					//+1 in forests
					if($cur_province["type"] == "Forest")
					{
						return 1;
					}
					return 0;
				}
				case 6:
				{
					//cavalry
					//+1 in plains
					if($cur_province["type"] == "Plains")
					{
						return 1;
					}
					return 0;
				}
				case 7:
				{
					//castle
					//+3 when defending
					if(!$is_attacking)
					{
						return 3;
					}
					return 0;
				}
				case 8:
				{
					//ship
					//always get +1... battles should only ever be at sea
					return 1;
				}
				case 9:
				{
					//siege engine
					//+2 in combat against castle or citadel
					$attacking_player_id = $this->getGameStateValue("attacking_player_id");
					$defending_player_id = $this->getGameStateValue("defending_player_id");
					$enemy_player_id = $attacking_player_id;
					if($player_id == $attacking_player_id)
					{
						$enemy_player_id = $defending_player_id;
					}
					$enemy_player_deck = $this->player_decks[$enemy_player_id];
					$enemy_armies = self::getCollectionFromDb("SELECT army_id, province_id FROM armies WHERE player_id='$enemy_player_id'");
					
					//loop over enemy armies to find a citadel or castle
					foreach($enemy_armies as $army_id => $army_info)
					{
						//get all tiles in this army
						$enemy_army_tiles = $enemy_player_deck->getCardsInLocation('army', $army_id);
						
						foreach($enemy_army_tiles as $index => $check_tile_info)
						{
							$enemy_tile_type = intval($check_tile_info["type_arg"]);
							//$enemy_base_type = $enemy_tile_type % $numtypes;
							if($this->isTileTypeCastle($enemy_tile_type) || $this->isTileTypeCitadel($enemy_tile_type))
							{
								return 2;
							}
						}
					}
					
					//no castle present, this siege engine is useless
					return 0;
				}
				case 10:
				{
					//leader
					//always get +1
					return 1;
				}
				case 11:
				{
					//special1
					//faction unique unit
					$faction_id = $this->GetPlayerFaction($player_id);
					switch($faction_id)
					{
						case(1):
						{
							//hillfolk
							return 2;
						}
						case(2):
						{
							//dragonriders
							return 4;
						}
						case(4):
						{
							//necromancers
							return 1;
						}
						default:
						{
							self::notifyAllPlayers("debug", "", array('debugmessage' => "ERROR: server::getTileCombatBonus($tile_type, $player_id, $is_attacking) unknown special1 tile_type for faction $faction_id"));
							break;
						}
					}
					return 0;
				}
				case 12:
				{
					//special2
					//faction unique unit
					$faction_id = $this->GetPlayerFaction($player_id);
					switch($faction_id)
					{
						case(4):
						{
							//necromancers
							return 1;
						}
						default:
						{
							self::notifyAllPlayers("debug", "", array('debugmessage' => "ERROR: server::getTileCombatBonus($tile_type, $player_id, $is_attacking) unknown special2 tile_type for faction $faction_id"));
							break;
						}
					}
					return 0;
				}
			}
		}
		
		//unknown tile type
		self::notifyAllPlayers("debug", "", array('debugmessage' => "ERROR: server::getTileCombatBonus($tile_type, $player_id, $is_attacking) unknown tile_type"));
		
		//return 0 by default
		return 0;
	}
	
	public function createNewZombieTile()
	{
		$player_id = $this->GetFactionPlayer(self::FACTION_NECROMANCERS);
		if(!$player_id)
		{
			//sanity check
			throw new BgaUserException( self::_("server::getNextAvailableZombieTileId() no player is necromancer faction") );
			return;
		}
		$necromancer_deck = $this->player_decks[$player_id];
		$undead_tiles = $necromancer_deck->getCardsInLocation("undead_available");
		
		//todo: should we limit the number of spawnable undead?
		$tiles_undead_template = array(array('type' => 'unit', 'type_arg' => self::TILE_UNDEAD, 'nbr' => 1));
		$necromancer_deck->createCards($tiles_undead_template, 'undead_available');
		$next_undead_tile = $necromancer_deck->getCardOnTop("undead_available");
		
		return $next_undead_tile['id'];
	}
}