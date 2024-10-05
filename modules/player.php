<?php

trait player_utils
{
	//other useful functions:
	/*
	$player_name = $this->getPlayerNameById($player_id);
	*/
	
	function GetPlayerFaction($player_id)
	{
		return self::getUniqueValueFromDB("SELECT player_factionid factionid FROM player WHERE player_id=$player_id");
	}
	
	function GetFactionPlayer($faction_id)
	{
		//invalid faction id
		if($faction_id < 0)
		{
			return 0;
		}
		
		//loop over the players and check what each assignment is
		$players = self::getCollectionFromDb("SELECT player_id id, player_factionid factionid FROM player ");
		foreach($players as $player_id => &$player)
		{
			if($player["factionid"] == $faction_id)
			{
				return $player_id;
			}
		}
		
		//we couldnt find it, so return 0
		return 0;
	}
	
	function GetPlayerCitadelProvId($player_id)
	{
		//not sure why this has to be cast to int, apparently its coming out of the database as a string
		$prov_id = (int)$this->getUniqueValueFromDB("SELECT player_citadel_prov FROM player WHERE player_id='$player_id'");
		//$vartype = gettype($prov_id);
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::GetPlayerCitadelProvId($player_id) prov_id:$prov_id vartype:$vartype"));
		return $prov_id;
	}
	
	function GetPlayerCitadelTileInfo($player_id)
	{
		$tile_info = null;
		try
		{
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::GetPlayerCitadelTileInfo($player_id)"));
			$faction_id = $this->GetPlayerFaction($player_id);
			$faction_deck = $this->faction_decks[$faction_id];
			$citadel_type = ($faction_id + 1) * self::UNIT_CITADEL;
			$tiles = $faction_deck->getCardsOfType('unit', $citadel_type);
			$citadel_tile_info;
			$citadel_tile_id = 0;
			foreach ($tiles as $tile_id => $tile_info)
			{
				if($citadel_tile_id != 0)
				{
					//sanity check
					throw new BgaUserException( self::_("GetPlayerCitadelTileInfo($player_id) multiple citadel tiles for this player's faction ($faction_id)") );
				}
				$citadel_tile_id = $tile_id;
				$citadel_tile_info = $tile_info;
			}
			
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "citadel_tile_id:$citadel_tile_id"));
			//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($tiles, true)));
			//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($tile_info, true)));
			
			return $citadel_tile_info;
		}
		catch (Exception $e)
		{
			self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($e, true)));
		}
		return null;
	}
	
	function PlayerCaptureCitadel($attacking_player_id, $defending_player_id)
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::PlayerCaptureCitadel($attacking_player_id, $defending_player_id)"));
		
		//grab some useful info
		$citadel_tile_info = $this->GetPlayerCitadelTileInfo($defending_player_id);
		$citadel_tile_id = $citadel_tile_info['id'];
		$citadel_army_id = $citadel_tile_info['location_arg'];
		//$citadel_player_deck = $this->player_decks[$defending_player_id];
		//$citadel_player_deck->moveCard($citadel_tile_id, 'discard');
		
		//update the database
		$num_captured = $this->getUniqueValueFromDB("SELECT captured_citadels FROM player WHERE player_id='$attacking_player_id'") + 1;
		self::DbQuery("UPDATE player SET captured_citadels='$num_captured' WHERE player_id='$attacking_player_id'");
		
		//notify all players
		self::notifyAllPlayers("citadelCapture", clienttranslate('${player_name1} has captured the citadel of ${player_name2}!'), array(
			'player_name1' => $this->getPlayerNameById($attacking_player_id),
			'player_name2' => $this->getPlayerNameById($defending_player_id),
			'citadel_army_id' => $citadel_army_id,
			'citadel_tile_id' => $citadel_tile_id,
			'attacking_player_id' => $attacking_player_id,
			'defending_player_id' => $defending_player_id
			));
	}
	
	function IsCurrentPlayerActive()
	{
		return (self::getActivePlayerId() == self::getCurrentPlayerId());
	}
	
	// get score
	function dbGetScore($player_id)
	{
		return $this->getUniqueValueFromDB("SELECT player_score FROM player WHERE player_id='$player_id'");
	}
	
	// set score
	function dbSetScore($player_id, $count)
	{
		$this->DbQuery("UPDATE player SET player_score='$count' WHERE player_id='$player_id'");
		self::notifyAllPlayers("playerScoreChanged", "", array('player_id' => $player_id, 'new_score' => $count));
	}
	
	// set aux score (tie breaker)
	function dbSetAuxScore($player_id, $score)
	{
		$this->DbQuery("UPDATE player SET player_score_aux=$score WHERE player_id='$player_id'");
	}

	// increment score (can be negative too)
	function dbIncScore($player_id, $inc, $log_message = true)
	{
		$count = $this->dbGetScore($player_id);
		if ($inc != 0) {
			$count += $inc;
			$this->dbSetScore($player_id, $count);
			$player_name = $this->getPlayerNameById($player_id);
			
			if($log_message)
			{
				self::notifyAllPlayers("logPlayerMessage", clienttranslate('${player_name} has gained ${incscore} Victory Points.'), array("player_name" => $player_name, "incscore" => $inc));
			}
			
		}
		return $count;
	}
	
	function countPlayerVillagesAvailable($player_id)
	{
		$faction_id = $this->GetPlayerFaction($player_id);
		return $this->countFactionVillagesAvailable($faction_id);
	}
	
	function countPlayerVillagesCaptured($player_id)
	{
		$faction_id = $this->GetPlayerFaction($player_id);
		return $this->countFactionVillagesCaptured($faction_id);
	}
	
	function getPlayerVillagesBuiltInfos($player_id)
	{
		$faction_id = $this->GetPlayerFaction($player_id);
		return $this->getVillagesBuiltFactionInfos($faction_id);
	}
	
	function setupFreebuildPlayerHands()
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::setupFreebuildPlayerHands()"));
		$players = self::getCollectionFromDb("SELECT player_id FROM player ");
		foreach($players as $player_id => $player)
		{
			//draw the hand of 9 tiles for players to place for free at the start of the game
			$this->PlayerHandDraw($player_id, true);
		}
	}
	
	function setupInitialPlayerHands()
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::setupInitialPlayerHands()"));
		$players = self::getCollectionFromDb("SELECT player_id FROM player ");
		foreach($players as $player_id => $player)
		{
			//after freebuilding, redraw up to maximum hand size for all players
			$this->PlayerHandDraw($player_id, false);
		}
	}
	
	function ActivePlayerHandDraw()
	{
		$active_player_id = $this->getActivePlayerId();
		$this->PlayerHandDraw($active_player_id);
	}
	
	function PlayerHandDraw($player_id, $isFreebuildHand = false)
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::PlayerHandDraw($player_id, $isFreebuildHand)"));
		$faction_id = $this->getPlayerFactionId($player_id);
		
		//horselords (faction_id 0) have a unique ability of increased hand size from 6 to 7
		$hand_size = 6;
		if($isFreebuildHand)
		{
			$hand_size = 9;
		}
		else if($faction_id == self::FACTION_HORSELORDS)
		{
			$hand_size = 7;
		}
		
		//do we have existing cards in hand? only draw up to the limit
		$player_deck = $this->faction_decks[$faction_id];
		$existing_hand_size = $player_deck->countCardInLocation('hand');
		
		//calculate how many to draw
		$new_cards = $hand_size - $existing_hand_size;
		if($existing_hand_size > 0)
		{
			$new_cards = $hand_size - $existing_hand_size;
		}
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "new_cards:$new_cards"));
		
		if($new_cards > 0)
		{
			//finally pick a random set of new tiles
			$tiles_drawn = $player_deck->pickCardsForLocation($new_cards, 'bag', 'hand');
			
			//note: pickCards() returns an array indexed by card id, however we want the array to be indexed by card id
			//lets get these into the format we want
			//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($tiles_drawn, true)));
			$tiles_drawn_indexed = [];
			foreach($tiles_drawn as $tile)
			{
				$tiles_drawn_indexed[$tile['id']] = $tile;
			}
			//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($tiles_drawn_indexed, true)));
			/*
			notif_playerHandChanged : function(notif)
			{
				console.log("page::notif_playerHandChanged()");
				console.log(notif);
				this.SetHiddenHandTiles(notif.args.player_id, notif.args.num_hand_tiles);
				this.UpdateHiddenHandTiles(notif.args.player_id);
			},
			*/
			
			self::notifyPlayer($player_id, "playerHandDraw", "", array('tiles_drawn' => $tiles_drawn_indexed));
			$this->notifyPlayerHandChanged($player_id, $hand_size);
		}
	}
	
	function DiscardTilesFromHand($paid_tile_infos, $owner_player_id)
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::DiscardTilesFromHand()"));
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($paid_tile_infos, true)));
		
		$paid_tile_ids = array();
		$pips_spent = 0;
		$player_deck = $this->player_decks[$owner_player_id];
		
		foreach($paid_tile_infos as $index => $paid_tile_info)
		{
			$paid_tile_id = $paid_tile_info["id"];
			array_push($paid_tile_ids, $paid_tile_id);
			$pips = $this->getTilePipsFromId($paid_tile_id, $player_deck);
			$pips_spent += $pips;
			//self::notifyAllPlayers("debug", "", array('debugmessage' => $paid_tile["id"]));
		}
		
		//move these tiles to the discard
		$player_deck->moveCards($paid_tile_ids, "discard");
		
		//update the players about the discarded cards
		self::notifyPlayer($owner_player_id, 'tileDiscard', '', array(
			'discarded_tiles' => $paid_tile_infos,
			'location_from' => "paystack"
		));
		
		$this->updatePlayerHandChanged($owner_player_id);
		
		return $pips_spent;
	}
	
	function updatePlayerHandChanged($player_id)
	{
		$player_deck = $this->player_decks[$player_id];
		$num_tiles = $player_deck->countCardInLocation('hand');
		$this->notifyPlayerHandChanged($player_id, $num_tiles);
	}
	
	function notifyPlayerHandChanged($player_id, $num_tiles)
	{
		self::notifyAllPlayers("playerHandChanged", "", array('player_id' => $player_id, 'num_hand_tiles' => $num_tiles));
	}
	
	public function AssignRandomPlayerFactions()
	{
		//for debugging: assign random player factions, create their citadels, then start the game
		self::notifyAllPlayers("debug", "", array('debugmessage' => "server::AssignRandomPlayerFactions()"));
		$players = self::getCollectionFromDb("SELECT player_id FROM player ");
		$cur_faction_id = 1;//rand(0,5);
		foreach($players as $player_id => $player)
		{
			//assign faction
			self::DbQuery("UPDATE player SET player_factionid='$cur_faction_id' WHERE player_id='$player_id';");
			
			//next faction
			$cur_faction_id++;
			if($cur_faction_id > 5)
			{
				$cur_faction_id = 0;
			}
		}
		
		self::notifyAllPlayers("debug", "", array('debugmessage' => "AssignRandomPlayerFactions() completed successfully"));
	}
	
	public function tryChooseFactionZombie($zombie_player_id)
	{
		for($check_faction_id=0; $check_faction_id<=5; $check_faction_id++)
		{
			$faction_player_id = $this->GetFactionPlayer($check_faction_id);
			if(!$faction_player_id)
			{
				$this->tryChooseFactionTemp($check_faction_id, $zombie_player_id);
				return;
			}
		}
	}
	
	public function tryChooseFactionTemp($faction_id)
	{
		//self::checkAction('action_chooseFaction');
		//$this->checkActionState("action_chooseFaction");
		$this->gamestate->checkPossibleAction("action_chooseFaction");
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::tryChooseFactionTemp($faction_id)"));
		
		$faction_player_id = $this->GetFactionPlayer($faction_id);
		$current_player_id = $this->getCurrentPlayerId();
		if($faction_player_id == 0)
		{
			$old_faction_id = $this->GetPlayerFaction($current_player_id);
			if($this->isValidFactionId($old_faction_id))
			{
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::tryChooseFactionTemp($faction_id) will unset old faction"));
			}
			
			self::DbQuery("UPDATE player SET player_factionid='$faction_id' WHERE player_id='$current_player_id';");
			
			$player_name = $this->getPlayerNameById($current_player_id);
			$faction_name = $this->getFactionName($faction_id);
			
			//this is not the correct way to do player notifications but i can fix it up later when i do a pass on translations
			self::notifyAllPlayers("playerChooseFaction", clienttranslate('${player_name} has chosen faction ${faction_name}'), array('player_id' => $current_player_id, 'player_name' => $player_name, 'faction_name' => $faction_name, 'faction_id' => $faction_id, 'old_faction_id' => $old_faction_id));
			
			$this->gamestate->setPlayerNonMultiactive($current_player_id, 'initNewGame');
		}
		else
		{
			//factionid is what the player tried to choose but it was already taken
			self::notifyAllPlayers("playerChooseFactionFail", "", array('player_id' => $current_player_id, 'faction_id' => $faction_id));
		}
	}
	
	public function tryUnchooseFactionTemp($faction_id)
	{
		//self::checkAction('action_unchooseFaction');
		//$this->checkActionState("action_unchooseFaction");
		$this->gamestate->checkPossibleAction("action_unchooseFaction");
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::tryUnchooseFactionTemp($faction_id)"));
		
		$current_player_id = $this->getCurrentPlayerId();
		$old_faction_id = $this->GetPlayerFaction($current_player_id);
		self::DbQuery("UPDATE player SET player_factionid='-1' WHERE player_id='$current_player_id';");
		
		$this->gamestate->setPlayersMultiactive(array($current_player_id), 'error');
		
		$player_name = $this->getPlayerNameById($current_player_id);
		self::notifyAllPlayers("playerChooseFaction", clienttranslate('${player_name} has cancelled their faction choice'), array('player_name' => $player_name, 'player_id' => $current_player_id, 'faction_id' => -1, 'old_faction_id' => $old_faction_id));
	}
	
	public function CanPlayerUndeadPhase($player_id)
	{
		if($this->getPlayerFactionId($player_id) == self::FACTION_NECROMANCERS)
		{
			/*
			ob_start();
			var_dump($this);
			$result = ob_get_clean();
			self::notifyAllPlayers("debug", "", array('debugmessage' => $result));
			*/
			
			//does this player have any undead units?
			$player_deck = $this->player_decks[$player_id];
			$all_tiles = $player_deck->getCardsInLocation("army");
			foreach($all_tiles as $tile_id => $tile_info)
			{
				//hardcode undead tile type
				if($this->isTileTypeUndead($tile_info["type_arg"]))
				{
					return true;
				}
			}
		}
		return false;
	}
	
	public function CanPlayerBuildVillages($player_id)
	{
		//take a shortcut here and just check if they have villages left to deploy
		//if the player doesn't have any valid locations to build there will be a different check for that later
		$villages_avail = $this->countPlayerVillagesAvailable($active_player_id);
		if($villages_avail == 0)
		{
			return false;
		}
		return true;
	}
	
	public function GetPlayerBuildableProvinces($player_id)
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::GetPlayerBuildableProvinces($player_id)"));
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($this->player_decks, true)));
		
		//chaos horde can build anywhere they have units, instead of at citadel or village
		$faction_id = $this->getPlayerFactionId($player_id);
		if($faction_id == self::FACTION_CHAOSHORDE)
		{
			return $this->GetChaosHordeBuildableProvinces($player_id);
		}
		$province_ids = [];
		
		/*
		$players = self::getCollectionFromDb("SELECT player_id, player_citadel_prov FROM player ");
		$initial_buildable_provs = [];
		foreach($players as $player_id => $player)
		{
			$citadel_prov_id = $player["player_citadel_prov"];
			$buildable_provs = array_merge([$citadel_prov_id], $this->GetAdjSeaProvIds($citadel_prov_id));
			$initial_buildable_provs[$player_id] = $buildable_provs;
		}
		$args = ["initial_buildable_provs" => $initial_buildable_provs];
		*/
		//todo: what about if the citadel is destroyed?
		$citadel_prov_id = $this->GetPlayerCitadelProvId($player_id);
		//$type = gettype($citadel_prov_id);
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "type:$type"));
		if($citadel_prov_id >= 0)
		{
			array_push($province_ids, $citadel_prov_id);
			
			//add any adjacent sea provinces for building ships
			$sea_provs = $this->GetAdjSeaProvIds($citadel_prov_id);
			foreach($sea_provs as $sea_prov_id)
			{
				if(!in_array($sea_prov_id, $province_ids))
				{
					array_push($province_ids, $sea_prov_id);
				}
			}
		}
		
		//next, loop over the villages
		/*array(
		   'id' => ..,          // the card ID
		   'type' => ..,        // the card type
		   'type_arg' => ..,    // the card type argument
		   'location' => ..,    // the card location
		   'location_arg' => .. // the card location argument
		);*/
		
		//all provinces with a village can build units
		$built_village_infos = $this->getPlayerVillagesBuiltInfos($player_id);
		$adjacent_provs_to_check = [];
		foreach($built_village_infos as $village_id => $village_info)
		{
			//check if this province is already in the build list
			//we need to do this because it's possible (and likely) to have 2 villages in some provinces
			$village_prov_id = $village_info['location_arg'];
			
			//is this one already in the list?
			if(!in_array($village_prov_id, $province_ids))
			{
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "adding village province $village_prov_id"));
				//we can build units here
				array_push($province_ids, $village_prov_id);
				
				//get all adjacent sea provinces and add them to the list
				//this is for ship building
				$sea_provs = $this->GetAdjSeaProvIds($village_prov_id);
				foreach($sea_provs as $sea_prov_id)
				{
					if(!in_array($sea_prov_id, $province_ids))
					{
						array_push($province_ids, $sea_prov_id);
					}
				}
				
				/*
				$prov_info = $this->getProvinceInfo($village_prov_id);
				//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($prov_info, true)));
				foreach($prov_info['movement_links'] as $adj_prov_id)
				{
					$adj_prov_info = $this->getProvinceInfo($adj_prov_id);
					//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($adj_prov_info, true)));
					if($adj_prov_info['type'] == "Sea")
					{
						//is this one already in the list?
						if(!in_array($adj_prov_id, $province_ids))
						{
							//we can build ships here
							array_push($province_ids, $adj_prov_id);
							//self::notifyAllPlayers("debug", "", array('debugmessage' => "adding sea province $adj_prov_id"));
						}
						else
						{
							//self::notifyAllPlayers("debug", "", array('debugmessage' => "found duplicate sea province $adj_prov_id"));
						}
					}
					else
					{
						//self::notifyAllPlayers("debug", "", array('debugmessage' => "skipping adjacent non-sea province $adj_prov_id"));
					}
				}*/
			}
		}
		
		$num_found = count($province_ids);
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "num_found:$num_found"));
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($province_ids, true)));
		return $province_ids;
	}
	
	public function GetChaosHordeBuildableProvinces($player_id)
	{
		$province_ids = [];
		$armies = $this->GetPlayerArmies($player_id);
		
		foreach($armies as $army_id => $army)
		{
			$prov_name = $army["province_id"];
			$prov_id = $this->getProvinceIdFromName($prov_name);
			$province_ids[] = $prov_id;
			
			//add in adjacent sea provinces as well
			$province_ids = array_merge($province_ids, $this->GetAdjSeaProvIds($prov_id));
		}
		
		return $province_ids;
	}
	
	public function playerSkipAction($player_id = 0)
	{
		self::checkAction('action_skip');
		$this->activePlayerCompleteState($player_id);
	}
	
	public function activePlayerCompleteState($player_id = 0)
	{
		//todo: should this function be merged with playerSkipAction() ?
		$state_name = $this->getStateName();
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::activePlayerCompleteState($player_id) state_name:$state_name"));
		if(!$player_id)
		{
			$player_id = self::getCurrentPlayerId();
		}
		
		switch($state_name)
		{
			case "factionSelect":
			{
				$this->tryChooseFactionZombie($player_id);
				break;
			}
			case "citadelPlacement":
			{
				$this->gamestate->nextState('nextCitadel');
				break;
			}
			case "freeBuild":
			{
				//wipe out any remaining player build points if they are unused
				self::DbQuery("UPDATE player SET player_freebuildpoints=0 WHERE player_id='$player_id'");
				$this->gamestate->setPlayerNonMultiactive($player_id, "freeBuild_chaosHorde_setup");
				break;
			}
			case "freeBuild_chaosHorde":
			{
				//wipe out any remaining player build points if they are unused
				self::DbQuery("UPDATE player SET player_freebuildpoints=0 WHERE player_id='$player_id'");
				$this->gamestate->setPlayerNonMultiactive($player_id, "playerMain");
				break;
			}
			case "playerCapture":
			{
				//todo: test this
				if($this->CanPlayerUndeadPhase($player_id))
				{
					$this->gamestate->nextState('playerUndead');
				}
				else
				{
					$this->gamestate->nextState('playerMain');
				}
				break;
			}
			case "playerUndead":
			{
				$this->gamestate->nextState('playerMain');
				break;
			}
			case "playerMain":
			{
				if($this->CanPlayerBuildVillages($player_id))
				{
					$this->gamestate->nextState('playerVillages');
				}
				else
				{
					$this->playerEndTurn();
				}
				break;
			}
			case "playerVillages":
			{
				$this->playerEndTurn();
				break;
			}
			case 'chooseWithdraw':
			{
				$this->tryRejectWithdraw();
				break;
			}
			case 'battleTile':
			{
				//tile_id -1 means it will skip the swap
				$this->game->trySwapTile(-1);
				break;
			}
			case 'battleEnd':
			{
				$this->sacrificeRandomUnit();
				break;
			}
			case 'retreat':
			{
				$this->retreatRandom();
				break;
			}
			default:
			{
				//todo: throw some kind of error here
				self::notifyAllPlayers("debug", array('debugmessage' => "server::playerSkipAction() unknown state: $state_name"));
			}
		}
	}
	
    function playerEndTurn()
	{
		//is this action allowed in this game state
		//$this->checkAction( $actionName, $bThrowException=true )
        if(!$this->IsCurrentPlayerActive())
		{
			throw new BgaUserException( self::_("You cannot end the turn when you are not the active player!") );
		}
		
		//units remaining in desert areas now die (except for some immune ones)
		$this->KillActivePlayerDesertTiles();
		
		//draw player hand cards
		$this->ActivePlayerHandDraw();
		
		//the game logic continues immediately in st_nextPlayer()
		$this->gamestate->nextState('nextPlayer');
	}
	
	function KillActivePlayerDesertTiles()
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::KillActivePlayerDesertTiles()"));
		$current_player_id = self::getCurrentPlayerId();
		$player_deck = $this->player_decks[$current_player_id];
		$armies = $this->GetPlayerArmies($current_player_id);
		
		//loop over all of this player's armies
		$dead_tiles = [];
		$dead_tiles_names = [];
		$surviving_tile_names = [];
		foreach($armies as $army_id => $army)
		{
			//check the province this army is in
			$province_name = $army["province_id"];
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "checking army$army_id in province $province_name"));
			
			//is this a desert province?
			if($this->GetProvinceTypeFromName($province_name) == "Desert")
			{
				//get the tiles in this army
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "desert province"));
				$tiles = $player_deck->getCardsInLocation("army", $army_id);
				
				//loop over the army to see if any tiles are at risk of dying
				foreach($tiles as $tile_id => $tile_info)
				{
					$tile_type = $tile_info["type_arg"];
					if($this->DoesTileTypeDieInDesert($tile_type))
					{
						//self::notifyAllPlayers("debug", "", array('debugmessage' => "killing tile type $tile_type"));
						$tile_id = $tile_info["id"];
						
						//sort the tile ids by army id for easier access on the client
						if(!array_key_exists($army_id, $dead_tiles))
						{
							$dead_tiles[$army_id] = [];
						}
						$dead_tiles[$army_id][] = $tile_id;
						
						//get the tile name so we can tell the player which tiles died
						$dead_tiles_names[] = $this->getTileNameFromType($tile_type);
						
						//move the tile into the discard pile ("killing" it)
						$player_deck->moveCard($tile_id, "discard");
					}
					else
					{
						$surviving_tile_names[] = $this->getTileNameFromType($tile_type);
					}
				}
				
				//if there are no tiles left in this army, delete it
				$tiles = $player_deck->getCardsInLocation("army", $army_id);
				if(count($tiles) == 0)
				{
					self::DbQuery("DELETE FROM armies WHERE army_id='$army_id';");
				}
			}
		}
		$num_killed = count($dead_tiles);
		if($num_killed > 0)
		{
			$this->incStat($num_killed, "terrain_losses", $current_player_id);
			
			$player_name = $this->getPlayerNameById($current_player_id);
			$units_string = implode(", ", $dead_tiles_names);
			if(count($surviving_tile_names) > 0)
			{
				$survivors_string = implode(", ", $surviving_tile_names);
				self::notifyAllPlayers("desert_tiles", clienttranslate('${player_name} has lost ${units_string} to the desert sands. ${survivors_string} has survived the desert heat.'), array('player_id' => $current_player_id, 'player_name' => $player_name, 'units_string' => $units_string, 'survivors_string' => $survivors_string, 'dead_tiles' => $dead_tiles));
			}
			else
			{
				self::notifyAllPlayers("desert_tiles", clienttranslate('${player_name} has lost ${units_string} to the desert sands.'), array('player_id' => $current_player_id, 'player_name' => $player_name, 'units_string' => $units_string, 'dead_tiles' => $dead_tiles));
			}
		}
		else
		{
				self::notifyAllPlayers("desert_tiles", "", array('dead_tiles' => []));
		}
	}
	
	public function IsPlayerCorsair($player_id)
	{
		$faction_id = $this->GetPlayerFaction($player_id);
		return ($faction_id == self::FACTION_CORSAIRS);
	}
	
	public function GetCorsairPlayer()
	{
		$faction_id = self::FACTION_CORSAIRS;
		return self::getUniqueValueFromDB("SELECT player_id FROM player WHERE player_factionid='$faction_id'");
	}
	
	public function GetNecromancersPlayer()
	{
		$faction_id = self::FACTION_NECROMANCERS;
		return self::getUniqueValueFromDB("SELECT player_id FROM player WHERE player_factionid='$faction_id'");;
	}
	
	public function GetChaosHordePlayer()
	{
		$faction_id = self::FACTION_CHAOSHORDE;
		return self::getUniqueValueFromDB("SELECT player_id FROM player WHERE player_factionid='$faction_id'");;
	}
	
	public function IsCurrentPlayerChaosHorde()
	{
		$current_player_id = $this->getCurrentPlayerId();
		$result = ($this->IsPlayerChaosHorde($current_player_id));
		return $result;
	}
	
	public function IsPlayerChaosHorde($player_id)
	{
		$faction_id = $this->GetPlayerFaction($player_id);
		$result = ($faction_id == self::FACTION_CHAOSHORDE);
		return $result;
	}
	
	function CalculateFinalPlayerScores()
	{
		//see https://en.doc.boardgamearena.com/Main_game_logic:_yourgamename.game.php#Tie_breaker
		//see https://en.doc.boardgamearena.com/Game_meta-information:_gameinfos.inc.php#Multiple_tie_breaker_management
		
		//each player gets extra VP equal to the number of captured villages
		$players = $this->getCollectionFromDb("SELECT player_id, player_factionid FROM player");
		foreach($players as $player_id => $player)
		{
			//calculate the vp for captured villages
			$captured_villages_score = $this->countPlayerVillagesCaptured($player_id);
			if($player["player_factionid"] == self::FACTION_CHAOSHORDE)
			{
				//chaos horde score double VP for captured villages
				$captured_villages_score = $captured_villages_score * 2;
			}
			
			//add the VP for captured villages
			$this->dbIncScore($player_id, $captured_villages_score);
			$this->incStat($captured_villages_score, "vp_captures", $player_id);
			
			//calculate VP for captured citadels
			$captured_citadels_score = $this->GetCapturedCitadels($player_id) * 5;
			
			//add the VP for captured citadels
			$this->dbIncScore($player_id, $captured_citadels_score);
			$this->incStat($captured_citadels_score, "vp_citadels", $player_id);
			
			//calculate the tie breaker
			//multiplying by 100 here is a little hack to have a priority order for tie breaking, see multiple tie breaker management above
			$num_villages_built = count($this->getPlayerVillagesBuiltInfos($player_id));
			$total_captured_score = $captured_villages_score + $captured_citadels_score;
			$aux_score = $num_villages_built * 100 + $total_captured_score;
			$this->dbSetAuxScore($player_id, $aux_score);
		}
	}
	
	function playerDebugAction()
	{
		self::notifyAllPlayers("debug", "", array('debugmessage' => "server::playerDebugAction()"));
		//note: this triggers a call to the args() function so i dont need to put anything else here
		
		//$this->GetPlayerCitadelTileInfo(self::getActivePlayerId());
		//$this->args_playermain();
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export(,true)));
		
		//$this->debugCreateUndead();
		
		//$this->KillActivePlayerDesertTiles();
		
		$this->GetPossibleCitadelProvinces();
		
		//for testing
		//$current_player_id = self::getCurrentPlayerId();
		//$args = $this->args_freeBuild();
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($args,true)));
	}
	
	function debugCreateUndead()
	{
		//now we will create a new undead tile!
		$undead_tile_ids = [$this->createNewZombieTile()];
		$prov_name = 'prov50';
		$player_id = $this->GetNecromancersPlayer();
		if(!$player_id)
		{
			self::notifyAllPlayers("debug", "", array('debugmessage' => "No necromancers player, cannot spawn undead!"));
			return;
		}
		$new_army = $this->createArmy($prov_name, $player_id, $undead_tile_ids);
		
		//get the info from this newly created army with its lone undead

		//send this info to the player
		self::notifyAllPlayers("battleResolve_undead", clienttranslate('DEBUG: created undead in ${prov_name}'), array(
			'prov_name' => $prov_name,
			'undead_army' => $new_army));
	}
}