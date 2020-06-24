// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
import {
  DataObject,
  Entity,
  EntityCrudRepository,
  Getter,
  HasManyDefinition,
} from '../..';
import {
  createTargetConstraintOnThrough,
  createThroughConstraintOnSource,
  createThroughConstraintOnTarget,
  getTargetKeyFromThroughModel,
  resolveHasManyThroughMetadata,
} from './has-many-through.helpers';
import {
  DefaultHasManyThroughRepository,
  HasManyThroughRepository,
} from './has-many-through.repository';

/**
 * a factory to generate hasManyThrough repository class.
 *
 * Warning: The hasManyThrough interface is experimental and is subject to change.
 * If backwards-incompatible changes are made, a new major version may not be
 * released.
 */

export type HasManyThroughRepositoryFactory<
  TargetEntity extends Entity,
  TargetID,
  ThroughEntity extends Entity,
  ForeignKeyType
> = (
  fkValue: ForeignKeyType,
) => HasManyThroughRepository<TargetEntity, TargetID, ThroughEntity>;

export function createHasManyThroughRepositoryFactory<
  Target extends Entity,
  TargetID,
  Through extends Entity,
  ThroughID,
  ForeignKeyType
>(
  relationMetadata: HasManyDefinition,
  targetRepositoryGetter: Getter<EntityCrudRepository<Target, TargetID>>,
  throughRepositoryGetter: Getter<EntityCrudRepository<Through, ThroughID>>,
): HasManyThroughRepositoryFactory<Target, TargetID, Through, ForeignKeyType> {
  const meta = resolveHasManyThroughMetadata(relationMetadata);
  const result = function (fkValue: ForeignKeyType) {
    function getTargetConstraintOnThrough(
      throughInstances: Through[],
    ): DataObject<Target> {
      return createTargetConstraintOnThrough<Target, Through>(
        meta,
        throughInstances,
      );
    }
    function getTargetKey(throughInstances: Through[]): TargetID[] {
      return getTargetKeyFromThroughModel(meta, throughInstances);
    }
    function getThroughConstraintOnSource(): DataObject<Through> {
      const constraint: DataObject<Through> = createThroughConstraintOnSource<
        Through,
        ForeignKeyType
      >(meta, fkValue);
      return constraint;
    }

    function getThroughConstraintOnTarget(
      fkValues: TargetID[],
    ): DataObject<Through> {
      const constraint: DataObject<Through> = createThroughConstraintOnTarget<
        Target,
        Through,
        TargetID
      >(meta, fkValues);
      return constraint;
    }

    return new DefaultHasManyThroughRepository<
      Target,
      TargetID,
      EntityCrudRepository<Target, TargetID>,
      Through,
      ThroughID,
      EntityCrudRepository<Through, ThroughID>
    >(
      targetRepositoryGetter,
      throughRepositoryGetter,
      getTargetConstraintOnThrough,
      getTargetKey,
      getThroughConstraintOnSource,
      getThroughConstraintOnTarget,
    );
  };
  return result;
}
