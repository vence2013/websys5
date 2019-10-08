
/********************************* Chip **************************************/

/*
DELETE FROM `websys5`.`Chips`;
INSERT INTO 
	`websys5`.`Chips`(`id`, `name`, `width`, `createdAt`, `updatedAt`)
SELECT
	`id`, `name`, `width`, `createdAt`, `updatedAt`
FROM
	`websys5-copy2`.`Chips`;
*/

/*
DELETE FROM `websys5`.`ChipModules`;
INSERT INTO 
	`websys5`.`ChipModules`(`id`, `name`, `fullname`, `createdAt`, `updatedAt`, `ChipId`)
SELECT
	`id`, `name`, `fullname`, `createdAt`, `updatedAt`, `ChipId`
FROM
	`websys5-copy2`.`ChipModules`;
*/

/*
DELETE FROM `websys5`.`ChipRegisters`;
INSERT INTO 
	`websys5`.`ChipRegisters`(`id`, `name`, `fullname`, `address`, `desc`, `createdAt`, `updatedAt`, `ChipModuleId`)
SELECT
	`id`, `name`, `fullname`, `address`, `desc`, `createdAt`, `updatedAt`, `ChipModuleId`
FROM
	`websys5-copy2`.`ChipRegisters`;
*/

/* ChipBits failed */


/********************************* Found *************************************/

/*
DELETE FROM `websys5`.`FoundCompanies`;
INSERT INTO 
	`websys5`.`FoundCompanies`(`code`, `name`, `attr`, `createDate`, `createMoney`, `moneyTotal`, `foundTotal`, `managerTotal`, `createdAt`, `updatedAt`)
SELECT 
	`code`, `name`, `attr`, `createDate`, `createMoney`, `moneyTotal`, `foundTotal`, `managerTotal`, `createdAt`, `updatedAt`
FROM 
	`websys5-copy2`.`FoundCompanies`;
*/

/*
DELETE FROM `websys5`.`Founds`;
INSERT INTO 
	`websys5`.`Founds`(`code`, `fullname`, `type`, `createDate`, `createShare`, `moneyUpdate`, `moneyUpdateDate`, `shareUpdate`, `shareUpdateDate`, `createdAt`, `updatedAt`, `FoundCompanyCode`)
SELECT
	`code`, `fullname`, `type`, `createDate`, `createShare`, `moneyUpdate`, `moneyUpdateDate`, `shareUpdate`, `shareUpdateDate`, `createdAt`, `updatedAt`, `FoundCompanyCode`
FROM
	`websys5-copy2`.`Founds`;
*/

/*
DELETE FROM `websys5`.`FoundStatistics`;
INSERT INTO 
	`websys5`.`FoundStatistics`(`lastWeek`, `lastMonth`, `lastQuarter`, `lastHalfYear`, `last1Year`, `last2Year`, `last3Year`, `thisYear`, `fromCreate`, `createdAt`, `updatedAt`, `FoundCode`)
SELECT
	`lastWeek`, `lastMonth`, `lastQuarter`, `lastHalfYear`, `last1Year`, `last2Year`, `last3Year`, `thisYear`, `fromCreate`, `createdAt`, `updatedAt`, `FoundCode`
FROM
	`websys5-copy2`.`FoundStatistics`;
*/

/*
DELETE FROM `websys5`.`FoundValues`;
INSERT INTO 
	`websys5`.`FoundValues`(`date`, `value`, `value2`, `value3`, `createdAt`, `updatedAt`, `FoundCode`)
SELECT
	`date`, `value`, `value2`, `value3`, `createdAt`, `updatedAt`, `FoundCode`
FROM
	`websys5-copy2`.`FoundValues`;
*/

/*
DELETE FROM `websys5`.`FoundFilters`;
INSERT INTO 
	`websys5`.`FoundFilters`(`father`, `name`, `value`, `createdAt`, `updatedAt`)
SELECT
	`father`, `name`, `value`, `createdAt`, `updatedAt`
FROM
	`websys5-copy2`.`FoundFilters`;
*/


/******************************************************************************
* Find data in table SRC, but not in table DST, add the data to DST.
******************************************************************************/

/*
INSERT INTO 
	`ChipDocuments2`(`content`, `bitslist`, `createdAt`, `updatedAt`, `ChipId`) 
SELECT 
	`content`, `bitslist`, `createdAt`, `updatedAt`, `ChipId`
FROM 
	`ChipDocuments` 
WHERE 
	(
		SELECT 
			COUNT(1) AS num 
		FROM 
			`ChipDocuments2` 
		WHERE 
			`ChipDocuments`.`content` = `ChipDocuments2`.`content`
	) = 0;	
*/



