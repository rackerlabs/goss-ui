import nock from 'nock';
import {
  listVMs,
  enrollVM,
  enrolledInGOSSService,
  guestFamilyDisplayName,
  GOSSServices,
  getServiceListForVM,
  isGOSSSupported,
  managedInstanceId,
  isPoweredOn,
  generateVMEnrollmentCSVData,
} from './vms';

const vmData = [
  {
    _rackspace: {
      accountId: '1234117',
    },
    config$uuid: '564de529-b39c-1e30-659f-ONE',
    guest: {
      guestFamily: 'linuxGuest',
      guestFullName: 'Ubuntu Linux (64-bit)',
      guestState: 'running',
    },
    name: 'ONE',
    availableField: [
      {
        key: 103,
        name: 'com.rackspace.goss.goss.vm.ssmid',
      },
      {
        key: 100234,
        name: 'com.rackspace.goss.goss.vm.services.os.admin',
      },
    ],
    value: [
      {
        key: 103,
        value: 'mi-12345',
      },
      {
        key: 100234,
        value: 'enrolled',
      },
    ],
  },
  {
    _rackspace: {
      accountId: '1234117',
    },
    config$uuid: '564de529-b39c-1e30-659f-TWO',
    guest: {
      guestFamily: 'linuxGuest',
      guestFullName: 'Ubuntu Linux (64-bit)',
      guestState: 'running',
    },
    name: 'TWO',

    availableField: [
      {
        key: 103,
        name: 'com.rackspace.goss.goss.vm.ssmid',
      },
    ],
    value: [
      {
        key: 103,
        value: 'mi-12345',
      },
      {
        key: 100234,
        value: 'enrolled',
      },
    ],
  },
];

describe('listVMs', () => {
  beforeEach(() => {
    nock('http://localhost')
      .get('/aws/api/vmc/v1.0/orgs/my-org-id/sddcs/my-sddc-id/vms')
      .reply(200, {
        data: {
          items: vmData,
        },
      });
  });

  it('returns VM data from API', async () => {
    const vms = await listVMs({ organizationId: 'my-org-id', sddcId: 'my-sddc-id' });
    expect(vms).toEqual(vmData);
  });
});

describe('enrollVM', () => {
  let scope;

  beforeEach(() => {
    scope = nock('http://localhost')
      .post('/aws/api/vmc/v1.0/orgs/my-org-id/sddcs/my-sddc-id/vms/my-vm-id/enroll', {
        services: ['one', 'two', 'three'],
        vm_username: 'myuser',
        vm_password: 'supersecret',
      })
      .reply(202);
  });

  it('enrolls VM in provided services', async () => {
    await enrollVM(
      { organizationId: 'my-org-id', sddcId: 'my-sddc-id', vmId: 'my-vm-id' },
      {
        services: ['one', 'two', 'three'],
        username: 'myuser',
        password: 'supersecret',
      },
    );
    scope.done();
  });
});

describe('guestFamilyDisplayName', () => {
  it('returns Linux display name', () => {
    expect(
      guestFamilyDisplayName({
        guest: {
          guestFamily: 'linuxGuest',
          guestFullName: 'CentOS 8 (64-bit)',
          guestState: 'running',
        },
        _rackspace: {
          isManagementVM: false,
        },
      }),
    ).toEqual('Linux');
  });

  it('returns Windows display name', () => {
    expect(
      guestFamilyDisplayName({
        guest: {
          guestFamily: 'windowsGuest',
          guestFullName: 'Microsoft Windows Server 2019 (64-bit)',
          guestState: 'running',
        },
        _rackspace: {
          isManagementVM: false,
        },
      }),
    ).toEqual('Windows');
  });

  it('returns unsupported for other OS', () => {
    expect(
      guestFamilyDisplayName({
        guest: {
          guestFamily: 'solaris',
          guestFullName: 'Solaris (64-bit)',
          guestState: 'running',
        },
        _rackspace: {
          isManagementVM: false,
        },
      }),
    ).toEqual('Unsupported');
  });
});

describe('isGOSSSupported', () => {
  it('returns true for running VM with supported OS', () => {
    expect(
      isGOSSSupported({
        guest: {
          guestFamily: 'linuxGuest',
          guestFullName: 'Ubuntu Linux (64-bit)',
          guestState: 'running',
        },
        _rackspace: {
          isManagementVM: false,
        },
      }),
    ).toEqual(true);
  });

  it('returns false for running VM with unsupported OS', () => {
    expect(
      isGOSSSupported({
        guest: {
          guestFamily: 'linuxGuest',
          guestFullName: 'Unsupported Linux',
          guestState: 'running',
        },
        _rackspace: {
          isManagementVM: false,
        },
      }),
    ).toEqual(false);
  });

  it('returns false for VMware-managed VM', () => {
    expect(
      isGOSSSupported({
        guest: {
          guestFamily: 'linuxGuest',
          guestFullName: 'Ubuntu Linux (64-bit)',
          guestState: 'running',
        },
        _rackspace: {
          isManagementVM: true,
        },
      }),
    ).toEqual(false);
  });
});

describe('isPoweredOn', () => {
  it('returns true for running VM', () => {
    expect(
      isPoweredOn({
        guest: {
          guestState: 'running',
        },
      }),
    ).toEqual(true);
  });

  it('returns false for non-running VM', () => {
    expect(
      isPoweredOn({
        guest: {
          guestState: 'notRunning',
        },
      }),
    ).toEqual(false);
  });
});

describe('enrolledInGOSSService', () => {
  Object.keys(GOSSServices).forEach(service => {
    it(`returns true if ${GOSSServices[service]} custom attribute value is set to "enrolled"`, () => {
      const data = {
        availableField: [
          {
            key: 100234,
            name: GOSSServices[service],
          },
        ],
        value: [
          {
            key: 100234,
            value: 'enrolled',
          },
        ],
      };

      expect(enrolledInGOSSService(data, GOSSServices[service])).toEqual(true);
    });

    it(`returns false if ${GOSSServices[service]} custom attribute value is not set to "enrolled"`, () => {
      const data = {
        availableField: [
          {
            key: 100234,
            name: GOSSServices[service],
          },
        ],
        value: [
          {
            key: 100234,
            value: 'not enrolled',
          },
        ],
      };

      expect(enrolledInGOSSService(data, GOSSServices[service])).toEqual(false);
    });

    it(`returns false if ${GOSSServices[service]} custom attribute value is not set`, () => {
      const data = {
        availableField: [
          {
            key: 100234,
            name: GOSSServices[service],
          },
        ],
        value: [
          {
            key: 1,
            value: 'some other value',
          },
        ],
      };

      expect(enrolledInGOSSService(data, GOSSServices[service])).toEqual(false);
    });

    it(`returns false if ${GOSSServices[service]} custom attribute is not set`, () => {
      const data = {
        availableField: [
          {
            key: 100234,
            name: 'NO.GOSS.STUFF',
          },
        ],
        value: [
          {
            key: 100234,
            value: 'NO.GOSS.STUFF value',
          },
        ],
      };

      expect(enrolledInGOSSService(data, GOSSServices[service])).toEqual(false);
    });
  });
});

describe('getServiceListForVM', () => {
  Object.keys(GOSSServices).forEach(service => {
    it(`returns ${GOSSServices[service]} in list when enabled`, () => {
      const data = {
        availableField: [
          {
            key: 100234,
            name: GOSSServices[service],
          },
        ],
        value: [
          {
            key: 100234,
            value: 'enrolled',
          },
        ],
      };

      expect(getServiceListForVM(data)).toContain(GOSSServices[service]);
    });

    it(`does not return ${GOSSServices[service]} in list when not enabled`, () => {
      const data = {
        availableField: [
          {
            key: 100234,
            name: 'NO.GOSS.STUFF',
          },
        ],
        value: [
          {
            key: 100234,
            value: 'NO.GOSS.STUFF value',
          },
        ],
      };

      expect(getServiceListForVM(data)).not.toContain(GOSSServices[service]);
    });
  });
});

describe('managedInstanceId', () => {
  it('returns true if custom attribute value is set', () => {
    const data = {
      availableField: [
        {
          key: 1000001,
          name: 'com.rackspace.goss.goss.vm.ssmid',
        },
      ],
      value: [
        {
          key: 1000001,
          value: 'mi-12345',
        },
      ],
    };

    expect(managedInstanceId(data)).toEqual('mi-12345');
  });

  it('returns null if custom attribute value is not set', () => {
    const data = {
      availableField: [
        {
          key: 1000001,
          name: 'com.rackspace.goss.goss.vm.ssmid',
        },
      ],
      value: [
        {
          key: 1,
          value: 'other',
        },
      ],
    };

    expect(managedInstanceId(data)).toEqual(null);
  });

  it('returns null if custom attribute is not set', () => {
    const data = {
      availableField: [
        {
          key: 1,
          name: 'NO.SSM.STUFF',
        },
      ],
      value: [
        {
          key: 1,
          value: 'NO.SSM.STUFF value',
        },
      ],
    };

    expect(managedInstanceId(data)).toEqual(null);
  });
});

describe('generateVMEnrollmentCSVData', () => {
  it('creates a list of lists to be fed into a CSV file', () => {
    const data = generateVMEnrollmentCSVData(vmData);
    expect(data.length).toBe(3);
  });

  it('creates a header row and then each subsequent row contains a value for name, instance id, os admin, monitoring, patching, and OS name', () => {
    const data = generateVMEnrollmentCSVData(vmData);

    const headerRow = data[0];
    expect(headerRow).toEqual(['Name', 'Instance UUID', 'OS Administration', 'Monitoring', 'Patching', 'OS Type']);

    const vmRow1 = data[1];
    expect(vmRow1.length).toBe(6);
    expect(vmRow1).toEqual(['ONE', '564de529-b39c-1e30-659f-ONE', true, false, false, 'Linux']);

    const vmRow2 = data[2];
    expect(vmRow2.length).toBe(6);
    expect(vmRow2).toEqual(['TWO', '564de529-b39c-1e30-659f-TWO', false, false, false, 'Linux']);
  });
});
