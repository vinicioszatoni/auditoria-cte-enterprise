//
import {CreationOptional, Model} from 'sequelize';
import {RepositoryBase} from './RepositoryBase';

class MockModel extends Model {
  declare id: CreationOptional<number>;
  declare name: string;
}
const loggerMock = {
  info: jest.fn(),
  error: jest.fn()
};

class MockRepository extends RepositoryBase<MockModel> {
  constructor() {
    super(MockModel, loggerMock);
  }
}

describe('RepositoryBase', () => {
  let repository: MockRepository;
  beforeAll(() => {
    repository = new MockRepository();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('findById - If executed successfully it should return item', async () => {
    jest.spyOn(MockModel, 'findByPk').mockResolvedValueOnce({id: 1, name: 'some-name'} as MockModel);

    const item = await repository.findById(1);
    expect(item).toStrictEqual({id: 1, name: 'some-name'});
    expect(loggerMock.error).toHaveBeenCalledTimes(0);
  });

  it('findById - If executed successfully but not found, should return empty object', async () => {
    jest.spyOn(MockModel, 'findByPk').mockResolvedValueOnce(null);

    const item = await repository.findById(1);
    expect(item).toStrictEqual({});
    expect(loggerMock.error).toHaveBeenCalledTimes(0);
  });

  it('deleteById - When an error occurs, should be return empty object', async () => {
    jest.spyOn(MockModel, 'findByPk').mockRejectedValueOnce(new Error('Some error'));

    await expect(repository.findById(1)).resolves.toEqual({});
    expect(loggerMock.error).toHaveBeenCalledTimes(1);
  });

  it('get - If executed successfully it should return items list', async () => {
    jest.spyOn(MockModel, 'findAll').mockResolvedValueOnce([
      {id: 1, name: 'some-name'},
      {id: 2, name: 'some-other-name'}
    ] as MockModel[]);

    const items = await repository.get({});
    expect(items).toStrictEqual([
      {id: 1, name: 'some-name'},
      {id: 2, name: 'some-other-name'}
    ]);
    expect(loggerMock.error).toHaveBeenCalledTimes(0);
  });

  it('get - When an error occurs, should be return empty list', async () => {
    jest.spyOn(MockModel, 'findAll').mockRejectedValueOnce(new Error('Some error'));

    await expect(repository.get({})).resolves.toStrictEqual([]);
    expect(loggerMock.error).toHaveBeenCalledTimes(1);
  });

  it('deleteById - If executed successfully it should return true', async () => {
    jest.spyOn(MockModel, 'findByPk').mockResolvedValueOnce({
      id: 1,
      name: 'some-name',
      destroy: jest.fn()
    } as unknown as MockModel);
    const result = await repository.deleteById(1);
    expect(result).toBe(true);
    expect(loggerMock.error).toHaveBeenCalledTimes(0);
  });

  it('deleteById - When an error occurs, should be return false', async () => {
    jest.spyOn(MockModel, 'findByPk').mockRejectedValueOnce(new Error('Some error'));

    await expect(repository.deleteById(1)).resolves.toEqual(false);
    expect(loggerMock.error).toHaveBeenCalledTimes(2);
  });

  it('save - Should save item', async () => {
    const data = {id: 1, name: 'some-name'};
    const result = await repository.save({
      ...data,
      save: jest.fn().mockResolvedValue(data)
    } as unknown as MockModel);
    expect(result).toStrictEqual({id: 1, name: 'some-name'});
    expect(loggerMock.error).toHaveBeenCalledTimes(0);
  });

  it('save - When an error occurs, an exception should be thrown', async () => {
    const data = {id: 1, name: 'some-name'};
    const modelInstance = {
      ...data,
      save: jest.fn().mockRejectedValue(new Error('Some error'))
    } as unknown as MockModel;

    await expect(repository.save(modelInstance)).rejects.toThrow('Some error');
    expect(loggerMock.error).toHaveBeenCalledTimes(1);
  });
});
