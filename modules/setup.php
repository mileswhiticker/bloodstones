
<?php

trait setup
{
    /*
        setupNewGame:
        
        This method is called only once, when a new game is launched.
        In this method, you must setup the game according to the game rules, so that
        the game is ready to be played.
    */
    protected function setupNewGame($players, $options = array())
    {
        /************ Start the game initialization *****/
		
        // Init global values with their initial values
		//public variables are not conserved in the class. it has to be done via database
        //self::setGameStateInitialValue( 'my_first_global_variable', 0 );
		self::setGameStateInitialValue('next_army_id', 0);
		self::setGameStateInitialValue('player_turn_phase', 0);
		self::setGameStateInitialValue('battling_province_id', -1);
		self::setGameStateInitialValue('placing_citadels', 1);
		self::setGameStateInitialValue('village_captures_available', 1);
		
		$this->setupFactionDecks($players, $options);
		$this->setupPlayers($players, $options);
		//$players = self::reloadPlayersBasicInfos();
		$this->setupBattleDecks();
		$this->setupVillagesDeck();
		
		//adjust the number of regroups based on the player count
		/*if(count($players) > 2)
		{
			$this->DbQuery("UPDATE player SET player_regroups='2'");
		}*/
		
		// Init game statistics
		// (note: statistics used in this file must be defined in your stats.inc.php file)
		//self::initStat( 'table', 'table_teststat1', 0 );    // Init a table statistics
		//self::initStat( 'player', 'player_teststat1', 0 );  // Init a player statistics (for all players)
		
		//todo: the current player turn number is already stored as a global variable, it doesnt need to be a game stat
		$this->initStat("table", "winning_faction", -1);
		$this->initStat("table", "turns_number", 0);
		$this->initStat("table", "battles_plains", 0);
		$this->initStat("table", "battles_forest", 0);
		$this->initStat("table", "battles_hills", 0);
		$this->initStat("table", "battles_mountains", 0);
		$this->initStat("table", "battles_desert", 0);
		$this->initStat("table", "battles_sea", 0);
		
		$this->initStat("player", "player_faction", -1);
		$this->initStat("player", "turns_number", 0);
		$this->initStat("player", "battles_won", 0);
		$this->initStat("player", "battles_lost", 0);
		$this->initStat("player", "battles_withdraw", 0);
		$this->initStat("player", "battles_attack", 0);
		$this->initStat("player", "battles_defend", 0);
		$this->initStat("player", "villages_built", 0);
		$this->initStat("player", "villages_captured", 0);
		$this->initStat("player", "tiles_built", 0);
		$this->initStat("player", "pips_move", 0);
		$this->initStat("player", "pips_built", 0);
		//$this->initStat("player", "ship_crossings", 0);
		//$this->initStat("player", "longest_move", 0);
		$this->initStat("player", "terrain_losses", 0);
		//$this->initStat("player", "castle_defences", 0);
		$this->initStat("player", "vp_villages", 0);
		$this->initStat("player", "vp_captures", 0);
		$this->initStat("player", "vp_battles", 0);
		$this->initStat("player", "vp_citadels", 0);
		
        /************ End of the game initialization *****/
    }
	
	protected function setupBattleDecks()
	{
		$tiles = array(
			array( 'type' => 'battle_tile', 'type_arg' => 79, 'nbr' => 2 ),
			array( 'type' => 'battle_tile', 'type_arg' => 80, 'nbr' => 2 ),
			array( 'type' => 'battle_tile', 'type_arg' => 81, 'nbr' => 2 ),
			array( 'type' => 'battle_tile', 'type_arg' => 82, 'nbr' => 2 ),
			array( 'type' => 'battle_tile', 'type_arg' => 83, 'nbr' => 2 )
		);
		$this->attacker_dice_deck->createCards($tiles);
		
		$tiles = array(
			array( 'type' => 'battle_tile', 'type_arg' => 92, 'nbr' => 2 ),
			array( 'type' => 'battle_tile', 'type_arg' => 93, 'nbr' => 2 ),
			array( 'type' => 'battle_tile', 'type_arg' => 94, 'nbr' => 2 ),
			array( 'type' => 'battle_tile', 'type_arg' => 95, 'nbr' => 2 ),
			array( 'type' => 'battle_tile', 'type_arg' => 96, 'nbr' => 2 )
		);
		$this->defender_dice_deck->createCards($tiles);
	}
	
	protected function setupFactionDecks($players, $options)
	{
		try
		{
			//setup the village and citadel tiles... only one type of teach
			$tiles_citadel = array(array( 'type' => 'citadel', 'type_arg' => 0, 'nbr' => 1));
			$tiles_villages = array(array( 'type' => 'village', 'type_arg' => 0, 'nbr' => 20));
			$tiles_undead = array(array('type' => 'unit', 'type_arg' => self::TILE_UNDEAD, 'nbr' => 4));
			
			//loop over each faction and create all the tile sets
			//tile stack types: citadel, village, unit
			$numtypes = 13;
			for($factionid=0; $factionid<6; $factionid++)
			{
				//setup the generic unit tiles, there are 12 types of units
				$tiles_units = array();
				for($basetypeid=0; $basetypeid<$numtypes; $basetypeid++)
				{
					//have a unique variant of each base type for each faction
					//for most factions and types these are cosmetic differences
					$tile_type = $basetypeid + $factionid * $numtypes;
					$tiles_units[] = array('type' => 'unit', 'type_arg' => $tile_type, 'nbr' => 0);
				}
				
				//customise the tilesets for each faction
				//unit types (0-10): blank, militia, sword, shield, archer, horse, castle, ship, siege, leader, special, special2 (zombies for necromancer faction)
				switch($factionid)
				{
					case(0):
						//horselords
						$tiles_units[0]['nbr'] = 0;		//blank
						$tiles_units[1]['nbr'] = 3;		//resources
						$tiles_units[2]['nbr'] = 0;		//attacking inf
						$tiles_units[3]['nbr'] = 6;		//sword
						$tiles_units[4]['nbr'] = 4;		//shield
						$tiles_units[5]['nbr'] = 4;		//archer
						$tiles_units[6]['nbr'] = 6;		//horse
						$tiles_units[7]['nbr'] = 4;		//castle
						$tiles_units[8]['nbr'] = 5;		//ship
						$tiles_units[9]['nbr'] = 2;		//siege
						$tiles_units[10]['nbr'] = 2;	//leader
						$tiles_units[11]['nbr'] = 0;	//special
						$tiles_units[12]['nbr'] = 0;	//special2 (zombies for necromancer faction)
						break;
						
					case(1):
						//hill folk
						$tiles_units[0]['nbr'] = 0;		//blank
						$tiles_units[1]['nbr'] = 2;		//resources
						$tiles_units[2]['nbr'] = 4;		//attacking inf
						$tiles_units[3]['nbr'] = 2;		//sword
						$tiles_units[4]['nbr'] = 4;		//shield
						$tiles_units[5]['nbr'] = 4;		//archer
						$tiles_units[6]['nbr'] = 4;		//horse
						$tiles_units[7]['nbr'] = 6;		//castle
						$tiles_units[8]['nbr'] = 5;		//ship
						$tiles_units[9]['nbr'] = 2;		//siege
						$tiles_units[10]['nbr'] = 1;	//leader
						$tiles_units[11]['nbr'] = 2;	//special (hillfolk giants, dragons, necromancers)
						$tiles_units[12]['nbr'] = 0;	//special2 (zombies for necromancer faction)
						break;
						
					case(2):
						//dragon riders
						$tiles_units[0]['nbr'] = 0;		//blank
						$tiles_units[1]['nbr'] = 2;		//resources
						$tiles_units[2]['nbr'] = 4;		//attacking inf
						$tiles_units[3]['nbr'] = 4;		//sword
						$tiles_units[4]['nbr'] = 4;		//shield
						$tiles_units[5]['nbr'] = 4;		//archer
						$tiles_units[6]['nbr'] = 4;		//horse
						$tiles_units[7]['nbr'] = 4;		//castle
						$tiles_units[8]['nbr'] = 5;		//ship
						$tiles_units[9]['nbr'] = 2;		//siege
						$tiles_units[10]['nbr'] = 1;	//leader
						$tiles_units[11]['nbr'] = 2;	//special (hillfolk giants, dragons, necromancers)
						$tiles_units[12]['nbr'] = 0;	//special2 (zombies for necromancer faction)
						break;
						
					case(3):
						//corsairs
						$tiles_units[0]['nbr'] = 0;		//blank
						$tiles_units[1]['nbr'] = 4;		//resources
						$tiles_units[2]['nbr'] = 0;		//attacking inf
						$tiles_units[3]['nbr'] = 12;	//sword
						$tiles_units[4]['nbr'] = 4;		//shield
						$tiles_units[5]['nbr'] = 4;		//archer
						$tiles_units[6]['nbr'] = 0;		//horse
						$tiles_units[7]['nbr'] = 2;		//castle
						$tiles_units[8]['nbr'] = 8;		//ship
						$tiles_units[9]['nbr'] = 1;		//siege
						$tiles_units[10]['nbr'] = 1;	//leader
						$tiles_units[11]['nbr'] = 0;	//special (hillfolk giants, dragons, necromancers)
						$tiles_units[12]['nbr'] = 0;	//special2 (zombies for necromancer faction)
						break;
											
					case(4):
						//necromancers
						$tiles_units[0]['nbr'] = 0;		//blank
						$tiles_units[1]['nbr'] = 0;		//resources
						$tiles_units[2]['nbr'] = 8;		//attacking inf
						$tiles_units[3]['nbr'] = 2;		//sword
						$tiles_units[4]['nbr'] = 2;		//shield
						$tiles_units[5]['nbr'] = 4;		//archer
						$tiles_units[6]['nbr'] = 4;		//horse
						$tiles_units[7]['nbr'] = 4;		//castle
						$tiles_units[8]['nbr'] = 5;		//ship
						$tiles_units[9]['nbr'] = 2;		//siege
						$tiles_units[10]['nbr'] = 1;	//leader
						$tiles_units[11]['nbr'] = 4;	//special (hillfolk giants, dragons, necromancers)
						//$tiles_units[12]['nbr'] = 4;	//special2 (zombies for necromancer faction)	//handled specially
						break;
												
					case(5):
						//chaos horde
						$tiles_units[0]['nbr'] = 0;		//blank
						$tiles_units[1]['nbr'] = 2;		//resources
						$tiles_units[2]['nbr'] = 20;	//attacking inf
						$tiles_units[3]['nbr'] = 0;		//sword
						$tiles_units[4]['nbr'] = 0;		//shield
						$tiles_units[5]['nbr'] = 0;		//archer
						$tiles_units[6]['nbr'] = 10;	//horse
						$tiles_units[7]['nbr'] = 0;		//castle
						$tiles_units[8]['nbr'] = 2;		//ship
						$tiles_units[9]['nbr'] = 0;		//siege
						$tiles_units[10]['nbr'] = 2;	//leader
						$tiles_units[11]['nbr'] = 0;	//special (hillfolk giants, dragons, necromancers)
						$tiles_units[12]['nbr'] = 0;	//special2 (zombies for necromancer faction)
						break;
						
					default:
						//TODO: throw an error here
						//this is safe for testing though i think
						$tiles_units[0]['nbr'] = 0;		//blank
						$tiles_units[1]['nbr'] = 0;		//resources
						$tiles_units[2]['nbr'] = 0;		//attacking inf
						$tiles_units[3]['nbr'] = 0;		//sword
						$tiles_units[4]['nbr'] = 0;		//shield
						$tiles_units[5]['nbr'] = 0;		//archer
						$tiles_units[6]['nbr'] = 0;		//horse
						$tiles_units[7]['nbr'] = 0;		//castle
						$tiles_units[8]['nbr'] = 0;		//ship
						$tiles_units[9]['nbr'] = 0;		//siege
						$tiles_units[10]['nbr'] = 0;	//leader
						$tiles_units[11]['nbr'] = 0;	//special (hillfolk giants, dragons, necromancers)
						$tiles_units[12]['nbr'] = 0;	//special2 (zombies for necromancer faction)
						break;
				}
				
				//finally, create the tile sets
				//todo: make this one big function call as recommended for optimisation
				//note for later: when picking cards for armies, set $location to 'player_army' and $location_arg to the integer army id
				$this->faction_decks[$factionid]->createCards($tiles_citadel, 'citadel_available');
				$this->faction_decks[$factionid]->createCards($tiles_villages, 'villages_available');
				$this->faction_decks[$factionid]->createCards($tiles_units, 'bag');
				if($factionid == self::FACTION_NECROMANCERS)
				{
					//we will only spawn these as needed for now
					//$this->faction_decks[$factionid]->createCards($tiles_undead, 'zombies_available');
				}
				$this->faction_decks[$factionid]->shuffle('bag');
			}
		}
		catch (Exception $e)
		{
		   $this->error("Fatal error in php setupFactionDecks()");
		   $this->dump('err', $e);
		}
	}
	
	public function ArePlayerDecksLinked()
	{
		return (count($this->player_decks) == $this->getPlayersNumber());
	}
	
	public function LinkPlayersToFactionDecksIfPossible()
	{
		//link players to their factions
		$this->player_decks = array();
		$players = self::getCollectionFromDb("SELECT player_id, player_factionid FROM player");
		foreach($players as $player_id => $player)
		{
			//have the player factions been assigned yet?
			if(!$this->isValidFactionId($player["player_factionid"]))
			{
				break;
			}
			$player_deck = $this->faction_decks[$player["player_factionid"]];
			$this->player_decks[$player_id] = $player_deck;
		}
	}
	
	protected function setupPlayers($players, $options)
	{
		try
		{
			// Set the colors of the players with HTML color code
			// The default below is red/green/blue/orange/brown
			// The number of colors defined here must correspond to the maximum number of players allowed for the gams
			$gameinfos = self::getGameinfos();
			$default_colors = $gameinfos['player_colors'];
			
			// Note: if you added some extra field on "player" table in the database (dbmodel.sql), you can initialize it there.
			$sql_statement = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES ";
			$values = array();
			
			//setup each player individually
			foreach($players as $player_id => $player)
			{
				//set player colour preferences
				$player_colour_preference = array_shift($default_colors);
				
				//finally prepare the sql statement for this player
				$values[] = "(
					'$player_id',
					'$player_colour_preference',
					'".$player['player_canal']."',
					'".addslashes( $player['player_name'] )."',
					'".addslashes( $player['player_avatar'] )."'
					)";
			}
			//$sql_statement = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar, player_factionid) VALUES ";
			$sql_statement .= implode(',', $values);
			self::DbQuery( $sql_statement );
			self::reattributeColorsBasedOnPreferences( $players, $gameinfos['player_colors'] );
			self::reloadPlayersBasicInfos();
		}
		catch (Exception $e)
		{
           $this->error("Fatal error in php setupPlayers()");
           $this->dump('err', $e);
		}
	}
	
	function setupVillagesDeck()
	{
		for($factionid=0; $factionid<6; $factionid++)
		{
			//chaos horde do not have any villages
			if($factionid != self::FACTION_CHAOSHORDE)
			{
				$starting_villages = 20;
				$village_tiles = array( 'type' => 'village', 'type_arg' => $factionid, 'nbr' => $starting_villages);
				$this->villages_deck->createCards(array($village_tiles), "hand", $factionid);
				
				//village Deck conventions:
				//$location (varchar16): "hand", $location_arg (int): factionid [0,6]
				//$location (varchar16): "captured", $location_arg (int): factionid [0,6]
				//$location (varchar16): "province", $location_arg (int): prov id [0,999999999+]
				//$type_arg (int): factionid [0,6]
				//these are important because later I will use getCardsOfTypeInLocation( $type, $type_arg=null, $location, $location_arg = null )
			}
		}
	}
	
	function InitNewGame()
	{
		//faction decks already exist they just need to be linked here
		$this->LinkPlayersToFactionDecksIfPossible();
		
		//draw the first hand of tiles for each player
		$this->setupFreebuildPlayerHands();
		
		//record the player starting factions
		$players = self::getCollectionFromDB( "SELECT player_id, player_factionid FROM player" );
		foreach($players as $player_id => $player)
		{
			$faction_id = $player["player_factionid"];
			$this->setStat($faction_id, "player_faction", $player_id);
			
			//chaos horde get a bonus 10 starting VP
			if($faction_id == self::FACTION_CHAOSHORDE)
			{
				$this->dbIncScore($player_id, 10);
			}
		}
		
		//todo: what else needs to go here?
	}
}